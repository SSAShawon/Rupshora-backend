
import express from "express";
import { ObjectId } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";

export default function eventRoutes(
  eventsCollection,
  participantsCollection,
  auth
) {
  const router = express.Router();

  // Get Featured Upcoming Events
  router.get("/featured", async (req, res) => {
    try {
      const events = await eventsCollection
        .find({
          eventDate: { $gt: new Date() },
        })
        .sort({ eventDate: 1 })
        .limit(6)
        .toArray();

      res.status(200).send({
        success: true,
        count: events.length,
        events,
      });
    } catch (error) {
      console.error("Error fetching featured events:", error);

      res.status(500).send({
        success: false,
        message: "Failed to fetch featured events",
      });
    }
  });

  // Get Completed Events
  router.get("/completed", async (req, res) => {
    try {
      const events = await eventsCollection
        .find({ status: "completed" })
        .sort({ eventDate: -1 })
        .toArray();

      res.status(200).send({
        success: true,
        count: events.length,
        events,
      });
    } catch (error) {
      console.error("Error fetching completed events:", error);

      res.status(500).send({
        success: false,
        message: "Failed to fetch completed events",
      });
    }
  });

  // Get All Upcoming Events
  router.get("/", async (req, res) => {
    try {
      const events = await eventsCollection
        .find({
          eventDate: { $gt: new Date() },
        })
        .sort({ eventDate: 1 })
        .toArray();

      res.status(200).send({
        success: true,
        count: events.length,
        events,
      });
    } catch (error) {
      console.error("Error fetching events:", error);

      res.status(500).send({
        success: false,
        message: "Failed to fetch events",
      });
    }
  });

  // Get Single Event Details
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({
          success: false,
          message: "Invalid event ID",
        });
      }

      const event = await eventsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!event) {
        return res.status(404).send({
          success: false,
          message: "Event not found",
        });
      }

      const participants = await participantsCollection
        .find({ eventId: id })
        .sort({ joinedAt: -1 })
        .toArray();

      res.status(200).send({
        success: true,
        event,
        participants,
        participantCount: participants.length,
      });
    } catch (error) {
      console.error("Error fetching event details:", error);

      res.status(500).send({
        success: false,
        message: "Failed to fetch event details",
      });
    }
  });

  // Create a New Event - Authenticated Users Only
  router.post("/", async (req, res) => {
    try {
      // Verify Better Auth session
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        return res.status(401).send({
          success: false,
          message: "Please login to create an event",
        });
      }

      const {
        title,
        description,
        eventType,
        thumbnail,
        location,
        eventDate,
      } = req.body;

      // Validate required fields
      if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof eventType !== "string" ||
        typeof thumbnail !== "string" ||
        typeof location !== "string" ||
        !title.trim() ||
        !description.trim() ||
        !eventType.trim() ||
        !thumbnail.trim() ||
        !location.trim() ||
        !eventDate
      ) {
        return res.status(400).send({
          success: false,
          message: "All event fields are required",
        });
      }

      // Validate image URL
      let imageUrl;

      try {
        imageUrl = new URL(thumbnail);

        if (
          imageUrl.protocol !== "http:" &&
          imageUrl.protocol !== "https:"
        ) {
          throw new Error("Invalid image URL");
        }
      } catch {
        return res.status(400).send({
          success: false,
          message: "Please provide a valid image URL",
        });
      }

      // Validate future date
      const parsedDate = new Date(eventDate);

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate <= new Date()
      ) {
        return res.status(400).send({
          success: false,
          message: "Please provide a valid future event date",
        });
      }

      // Create event using authenticated user's information
      const newEvent = {
        title: title.trim(),
        description: description.trim(),
        eventType: eventType.trim(),
        thumbnail: imageUrl.toString(),
        location: location.trim(),
        eventDate: parsedDate,

        creatorId: session.user.id,
        creatorName: session.user.name,
        creatorEmail: session.user.email,
        creatorPhoto: session.user.image || "",

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await eventsCollection.insertOne(newEvent);

      res.status(201).send({
        success: true,
        message: "Event created successfully",
        eventId: result.insertedId,
      });
    } catch (error) {
      console.error("Error creating event:", error);

      res.status(500).send({
        success: false,
        message: "Failed to create event",
      });
    }
  });

  return router;
}

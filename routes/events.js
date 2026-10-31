import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

export default function eventRoutes(eventsCollection, participantsCollection) {
  // Get Featured Upcoming Events
  router.get("/featured", async (req, res) => {
    try {
      const currentDate = new Date();

      const events = await eventsCollection
        .find({
          eventDate: { $gt: currentDate },
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
      const currentDate = new Date();

      const events = await eventsCollection
        .find({
          eventDate: { $gt: currentDate },
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

  // Create a New Event
  router.post("/", async (req, res) => {
    try {
      const {
        title,
        description,
        eventType,
        thumbnail,
        location,
        eventDate,
        creatorName,
        creatorEmail,
      } = req.body;

      if (
        !title ||
        !description ||
        !eventType ||
        !thumbnail ||
        !location ||
        !eventDate ||
        !creatorName ||
        !creatorEmail
      ) {
        return res.status(400).send({
          success: false,
          message: "All fields are required",
        });
      }

      const parsedDate = new Date(eventDate);

      if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
        return res.status(400).send({
          success: false,
          message: "Please provide a valid future event date",
        });
      }

      const newEvent = {
        title,
        description,
        eventType,
        thumbnail,
        location,
        eventDate: parsedDate,
        creatorName,
        creatorEmail,
        createdAt: new Date(),
      };

      const result = await eventsCollection.insertOne(newEvent);

      res.status(201).send({
        success: true,
        message: "Event created successfully",
        insertedId: result.insertedId,
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

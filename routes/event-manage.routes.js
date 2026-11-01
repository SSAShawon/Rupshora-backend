import express from "express";
import { ObjectId } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";

export default function manageEventRoutes(
  eventsCollection,
  participantsCollection,
  auth,
) {
  const router = express.Router();

  // Get Events Created by Logged-in User
  router.get("/my-events", async (req, res) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        return res.status(401).send({
          success: false,
          message: "Please login first",
        });
      }

      const events = await eventsCollection
        .find({ creatorId: session.user.id })
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).send({
        success: true,
        count: events.length,
        events,
      });
    } catch (error) {
      console.error("My Events Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to fetch your events",
      });
    }
  });

  // Update Event - Owner Only
  router.patch("/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        return res.status(401).send({
          success: false,
          message: "Please login first",
        });
      }

      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({
          success: false,
          message: "Invalid event ID",
        });
      }

      const { title, description, eventType, thumbnail, location, eventDate } =
        req.body;

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
          message: "All fields are required",
        });
      }

      let imageUrl;

      try {
        imageUrl = new URL(thumbnail);

        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        return res.status(400).send({
          success: false,
          message: "Invalid image URL",
        });
      }

      const parsedDate = new Date(eventDate);

      if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
        return res.status(400).send({
          success: false,
          message: "Please provide a valid future event date",
        });
      }

      const result = await eventsCollection.updateOne(
        {
          _id: new ObjectId(id),
          creatorId: session.user.id,
        },
        {
          $set: {
            title: title.trim(),
            description: description.trim(),
            eventType: eventType.trim(),
            thumbnail: imageUrl.toString(),
            location: location.trim(),
            eventDate: parsedDate,
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return res.status(404).send({
          success: false,
          message: "Event not found or you are not the owner",
        });
      }

      res.status(200).send({
        success: true,
        message: "Event updated successfully",
      });
    } catch (error) {
      console.error("Update Event Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to update event",
      });
    }
  });

  // Delete Event - Owner Only
  router.delete("/:id", async (req, res) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        return res.status(401).send({
          success: false,
          message: "Please login first",
        });
      }

      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({
          success: false,
          message: "Invalid event ID",
        });
      }

      const result = await eventsCollection.deleteOne({
        _id: new ObjectId(id),
        creatorId: session.user.id,
      });

      if (result.deletedCount === 0) {
        return res.status(404).send({
          success: false,
          message: "Event not found or you are not the owner",
        });
      }

      await participantsCollection.deleteMany({
        eventId: id,
      });

      res.status(200).send({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Delete Event Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to delete event",
      });
    }
  });

  return router;
}

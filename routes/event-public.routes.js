import express from "express";
import { ObjectId } from "mongodb";

export default function publicEventRoutes(
  eventsCollection,
  participantsCollection,
) {
  const router = express.Router();

  // Featured Upcoming Events
  router.get("/featured", async (req, res) => {
    try {
      const events = await eventsCollection
        .find({
          eventDate: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate(),
            ),
          },
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
      console.error("Featured Events Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to fetch featured events",
      });
    }
  });

  // Completed Events
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
      console.error("Completed Events Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to fetch completed events",
      });
    }
  });

  // All Upcoming Events
  router.get("/", async (req, res) => {
    try {
      const events = await eventsCollection
        .find({
          eventDate: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate(),
            ),
          },
        })
        .sort({ eventDate: 1 })
        .toArray();

      res.status(200).send({
        success: true,
        count: events.length,
        events,
      });
    } catch (error) {
      console.error("All Events Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to fetch events",
      });
    }
  });

  // Single Event Details
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
      console.error("Event Details Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to fetch event details",
      });
    }
  });

  return router;
}

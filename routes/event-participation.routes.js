
import express from "express";
import { ObjectId } from "mongodb";
import { verifyJWT } from "../middleware/verify-jwt.js";

export default function participationRoutes(
  eventsCollection,
  participantsCollection,
) {
  const router = express.Router();

  // Join an Event
  router.post("/:id/join", verifyJWT, async (req, res) => {
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

      if (new Date(event.eventDate) <= new Date()) {
        return res.status(400).send({
          success: false,
          message: "This event is no longer available for joining",
        });
      }

      const existingParticipant = await participantsCollection.findOne({
        eventId: id,
        userId: req.user.id,
      });

      if (existingParticipant) {
        return res.status(409).send({
          success: false,
          message: "You have already joined this event",
        });
      }

      const participant = {
        eventId: id,
        userId: req.user.id,
        userEmail: req.user.email,
        userName: req.user.name,
        userPhoto: req.user.image || "",
        joinedAt: new Date(),
      };

      await participantsCollection.insertOne(participant);

      res.status(201).send({
        success: true,
        message: "You have successfully joined this event",
      });
    } catch (error) {
      console.error("Join Event Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to join event",
      });
    }
  });

  // Get Events Joined by Logged-in User
  router.get("/joined-events", verifyJWT, async (req, res) => {
    try {
      const joinedRecords = await participantsCollection
        .find({ userId: req.user.id })
        .toArray();

      const eventIds = joinedRecords
        .map((record) => record.eventId)
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      const joinedEvents = await eventsCollection
        .find({ _id: { $in: eventIds } })
        .sort({ eventDate: 1 })
        .toArray();

      const joinedAtMap = new Map(
        joinedRecords.map((record) => [
          record.eventId,
          record.joinedAt,
        ]),
      );

      const events = joinedEvents.map((event) => ({
        ...event,
        joinedAt: joinedAtMap.get(event._id.toString()),
      }));

      res.status(200).send({
        success: true,
        count: events.length,
        events,
      });
    } catch (error) {
      console.error("Joined Events Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to fetch joined events",
      });
    }
  });

  return router;
}

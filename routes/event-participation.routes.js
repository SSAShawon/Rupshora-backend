import express from "express";
import { ObjectId } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";

export default function participationRoutes(
  eventsCollection,
  participantsCollection,
  auth
) {
  const router = express.Router();

  // Join an Event
  router.post("/:id/join", async (req, res) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        return res.status(401).send({
          success: false,
          message: "Please login to join an event",
        });
      }

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
        userId: session.user.id,
      });

      if (existingParticipant) {
        return res.status(409).send({
          success: false,
          message: "You have already joined this event",
        });
      }

      const participant = {
        eventId: id,
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        userPhoto: session.user.image || "",
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
  router.get("/joined-events", async (req, res) => {
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

      const joinedRecords = await participantsCollection
        .find({ userId: session.user.id })
        .sort({ joinedAt: -1 })
        .toArray();

      const eventIds = joinedRecords
        .map((record) => record.eventId)
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      const joinedEvents = await eventsCollection
        .find({ _id: { $in: eventIds } })
        .toArray();

      const eventMap = new Map(
        joinedEvents.map((event) => [event._id.toString(), event])
      );

      const events = joinedRecords
        .map((record) => {
          const event = eventMap.get(record.eventId);

          if (!event) return null;

          return {
            ...event,
            joinedAt: record.joinedAt,
          };
        })
        .filter(Boolean);

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
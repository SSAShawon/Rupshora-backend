import express from "express";
import { fromNodeHeaders } from "better-auth/node";

export default function createEventRoutes(eventsCollection, auth) {
  const router = express.Router();

  // Create Event - Authenticated Users Only
  router.post("/", async (req, res) => {
    try {
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

      let imageUrl;

      try {
        imageUrl = new URL(thumbnail);

        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        return res.status(400).send({
          success: false,
          message: "Please provide a valid image URL",
        });
      }

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
      console.error("Create Event Error:", error);
      res.status(500).send({
        success: false,
        message: "Failed to create event",
      });
    }
  });

  return router;
}
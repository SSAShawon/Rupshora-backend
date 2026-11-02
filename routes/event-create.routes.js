
import express from "express";
import { verifyJWT } from "../middleware/verify-jwt.js";

export default function createEventRoutes(eventsCollection) {
  const router = express.Router();

  // Create Event - JWT Authenticated Users Only
  router.post("/", verifyJWT, async (req, res) => {
    try {
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

        creatorId: req.user.id,
        creatorName: req.user.name,
        creatorEmail: req.user.email,
        creatorPhoto: req.user.image || "",

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

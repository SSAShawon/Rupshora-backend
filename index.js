import express from "express";
import { MongoClient } from "mongodb";
import eventRoutes from "./routes/events.js";
import "dotenv/config";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { createAuth } from "./auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://rupshora-khulna.vercel.app",
    ],
    credentials: true,
  })
);

// MongoDB Connection
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err;
  }
}

// Database
const mongoClient = await connectToMongoDB();
const db = mongoClient.db("rupshora");

// Better Auth
const auth = createAuth(db);

// Better Auth Route (Must be before express.json)
app.all("/api/auth/*splat", toNodeHandler(auth));

// JSON Middleware
app.use(express.json());

// Collections
const eventsCollection = db.collection("events");
const participantsCollection = db.collection("participants");

// Event Routes
app.use(
  "/api/events",
  eventRoutes(eventsCollection, participantsCollection, auth)
);

// Test Route
app.get("/", (req, res) => {
  res.send({
    message: "Rupshora Server is Running!",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server Running at Port ${PORT}`);
});

export default app;
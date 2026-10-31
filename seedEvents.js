
import { MongoClient } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_URI);

const events = [
  {
    title: "Community Clean-Up Drive",
    description:
      "Join local volunteers to clean public spaces and make our community healthier and more beautiful.",
    eventType: "Environment",
    thumbnail:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000",
    location: "Sonadanga, Khulna",
    eventDate: new Date("2026-11-14T09:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    createdAt: new Date(),
  },
  {
    title: "Winter Clothes Donation",
    description:
      "Help underprivileged families stay warm this winter by donating clothes and supporting our distribution campaign.",
    eventType: "Donation",
    thumbnail:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000",
    location: "Khalishpur, Khulna",
    eventDate: new Date("2026-11-21T10:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    createdAt: new Date(),
  },
  {
    title: "Food Distribution for Families",
    description:
      "Come together to distribute nutritious meals to families who need support in our community.",
    eventType: "Food Support",
    thumbnail:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1000",
    location: "Boyra, Khulna",
    eventDate: new Date("2026-11-28T11:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    createdAt: new Date(),
  },
  {
    title: "Free Health Awareness Camp",
    description:
      "Promote healthy living through basic health awareness, educational sessions, and community support.",
    eventType: "Healthcare",
    thumbnail:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000",
    location: "Daulatpur, Khulna",
    eventDate: new Date("2026-12-05T09:30:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    createdAt: new Date(),
  },
  {
    title: "Save Our River Campaign",
    description:
      "Take part in protecting our rivers through a community awareness and riverside cleaning campaign.",
    eventType: "Environment",
    thumbnail:
      "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=1000",
    location: "Rupsha River, Khulna",
    eventDate: new Date("2026-12-12T08:30:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    createdAt: new Date(),
  },
  {
    title: "Support Children's Education",
    description:
      "Volunteer to support children's learning through educational activities, books, and learning materials.",
    eventType: "Education",
    thumbnail:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000",
    location: "Gollamari, Khulna",
    eventDate: new Date("2026-12-19T10:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    createdAt: new Date(),
  },
  {
    title: "Community Tree Care Day",
    description:
      "Help care for newly planted trees and encourage a greener, cleaner environment for future generations.",
    eventType: "Environment",
    thumbnail:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000",
    location: "Khan Jahan Ali Road, Khulna",
    eventDate: new Date("2027-01-09T09:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    createdAt: new Date(),
  },
];

async function seedEvents() {
  try {
    await client.connect();

    console.log("MongoDB connected!");

    const db = client.db("rupshora");
    const eventsCollection = db.collection("events");

    const existingEvents = await eventsCollection
      .find({
        title: { $in: events.map((event) => event.title) },
      })
      .project({ title: 1 })
      .toArray();

    const existingTitles = new Set(
      existingEvents.map((event) => event.title)
    );

    const newEvents = events.filter(
      (event) => !existingTitles.has(event.title)
    );

    if (newEvents.length === 0) {
      console.log("All demo events already exist!");
      return;
    }

    const result = await eventsCollection.insertMany(newEvents);

    console.log(`${result.insertedCount} events added successfully!`);
  } catch (error) {
    console.error("Error adding events:", error);
  } finally {
    await client.close();
  }
}

seedEvents();

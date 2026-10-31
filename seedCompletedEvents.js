import { MongoClient } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_URI);

const completedEvents = [
  {
    title: "Community Clean-Up Campaign",
    description:
      "Volunteers came together to clean public spaces and make the community cleaner and healthier.",
    eventType: "Environment",
    thumbnail:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000",
    location: "Sonadanga, Khulna",
    eventDate: new Date("2026-09-12T09:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    participantsCount: 45,
    status: "completed",
    createdAt: new Date("2026-09-01T10:00:00+06:00"),
  },
  {
    title: "Winter Clothes Donation Drive",
    description:
      "A community donation campaign to collect and distribute clothes to families in need.",
    eventType: "Donation",
    thumbnail:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000",
    location: "Khalishpur, Khulna",
    eventDate: new Date("2026-09-20T10:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    participantsCount: 32,
    status: "completed",
    createdAt: new Date("2026-09-05T10:00:00+06:00"),
  },
  {
    title: "Free Educational Workshop",
    description:
      "An educational workshop focused on helping students develop essential digital and learning skills.",
    eventType: "Education",
    thumbnail:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000",
    location: "Gollamari, Khulna",
    eventDate: new Date("2026-09-27T10:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    participantsCount: 28,
    status: "completed",
    createdAt: new Date("2026-09-10T10:00:00+06:00"),
  },
  {
    title: "Community Food Distribution",
    description:
      "Volunteers distributed food packages to underprivileged families in the local community.",
    eventType: "Food Support",
    thumbnail:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1000",
    location: "Boyra, Khulna",
    eventDate: new Date("2026-10-03T11:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    participantsCount: 56,
    status: "completed",
    createdAt: new Date("2026-09-15T10:00:00+06:00"),
  },
  {
    title: "Tree Plantation Program",
    description:
      "Community members planted trees and raised awareness about environmental protection.",
    eventType: "Environment",
    thumbnail:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000",
    location: "Rupsha, Khulna",
    eventDate: new Date("2026-10-10T09:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    participantsCount: 68,
    status: "completed",
    createdAt: new Date("2026-09-20T10:00:00+06:00"),
  },
  {
    title: "Public Health Awareness Camp",
    description:
      "A community awareness program promoting healthy living and basic healthcare knowledge.",
    eventType: "Healthcare",
    thumbnail:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000",
    location: "Daulatpur, Khulna",
    eventDate: new Date("2026-10-17T09:30:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    participantsCount: 40,
    status: "completed",
    createdAt: new Date("2026-09-25T10:00:00+06:00"),
  },
  {
    title: "Children's Learning Support",
    description:
      "Volunteers helped children with educational activities and distributed learning materials.",
    eventType: "Education",
    thumbnail:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1000",
    location: "Khan Jahan Ali, Khulna",
    eventDate: new Date("2026-10-24T10:00:00+06:00"),
    creatorName: "Shawon",
    creatorEmail: "shawon@example.com",
    participantsCount: 35,
    status: "completed",
    createdAt: new Date("2026-10-01T10:00:00+06:00"),
  },
];

async function seedCompletedEvents() {
  try {
    await client.connect();

    console.log("MongoDB connected!");

    const db = client.db("rupshora");
    const eventsCollection = db.collection("events");

    const existingEvents = await eventsCollection
      .find({
        title: { $in: completedEvents.map((event) => event.title) },
      })
      .project({ title: 1 })
      .toArray();

    const existingTitles = new Set(
      existingEvents.map((event) => event.title)
    );

    const newEvents = completedEvents.filter(
      (event) => !existingTitles.has(event.title)
    );

    if (newEvents.length === 0) {
      console.log("All completed events already exist!");
      return;
    }

    const result = await eventsCollection.insertMany(newEvents);

    console.log(`${result.insertedCount} completed events added!`);
  } catch (error) {
    console.error("Error adding completed events:", error);
  } finally {
    await client.close();
  }
}

seedCompletedEvents();
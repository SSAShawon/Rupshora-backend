
import express from "express";

import publicEventRoutes from "./event-public.routes.js";
import manageEventRoutes from "./event-manage.routes.js";
import participationRoutes from "./event-participation.routes.js";
import createEventRoutes from "./event-create.routes.js";

export default function eventRoutes(
  eventsCollection,
  participantsCollection,
  auth
) {
  const router = express.Router();

  // Join Event & Joined Events
  router.use(
    "/",
    participationRoutes(
      eventsCollection,
      participantsCollection,
      auth
    )
  );

  // Manage My Events (View, Update, Delete)
  router.use(
    "/",
    manageEventRoutes(
      eventsCollection,
      participantsCollection,
      auth
    )
  );

  // Create New Event
  router.use(
    "/",
    createEventRoutes(eventsCollection, auth)
  );

  // Public Events (Keep Last)
  router.use(
    "/",
    publicEventRoutes(
      eventsCollection,
      participantsCollection
    )
  );

  return router;
}

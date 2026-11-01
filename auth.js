import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

export function createAuth(db) {
  return betterAuth({
    database: mongodbAdapter(db),

    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,

    trustedOrigins: [
      "http://localhost:3000",
      "https://rupshora-khulna.vercel.app",
    ],

    emailAndPassword: {
      enabled: true,
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
  });
}
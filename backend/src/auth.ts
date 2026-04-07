import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: [
    "rangya://",
    "exp://192.168.100.13:8081",
    "http://localhost:8081",
    "http://192.168.100.13:8081",
  ],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string"
      },
    }
  },
  plugins: [bearer(), expo()],
});

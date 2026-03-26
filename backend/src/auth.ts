import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: "http://192.168.100.13:3000",
  trustedOrigins: [
    "rangya://",
    "exp://192.168.100.13:8081",
    "http://localhost:8081",
    "http://192.168.100.13:8081",
  ],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer(), expo()],
});

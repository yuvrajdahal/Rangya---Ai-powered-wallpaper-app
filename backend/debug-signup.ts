import "dotenv/config";
import { auth } from "./src/auth";

async function debugSignup() {
  try {
    console.log("Trying to sign up a test user...");
    const res = await auth.api.signUpEmail({
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "user",
      },
    });
    console.log("Signup success:", res);
  } catch (error: any) {
    console.error("Signup failed!");
    if (error.name) console.error("Error name:", error.name);
    if (error.message) console.error("Error message:", error.message);
    if (error.stack) console.error("Error stack:", error.stack);
    if (error.body) {
      console.error("Error body:", error.body);
    }
  }
}

debugSignup();

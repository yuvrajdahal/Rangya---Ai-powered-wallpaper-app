const signUp = async () => {
  const email = "test@example.com";
  console.log();

  const response = await fetch("http://localhost:3001/api/auth/sign-up/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: "Password123!",
      name: "Test User",
    }),
  });

  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Response:", JSON.stringify(data, null, 2));
};

signUp().catch(console.error);

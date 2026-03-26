import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import imageRoutes from "./modules/image/image.routes";
import categoryRoutes from "./modules/category/category.routes";
import paymentRoutes from "./modules/payment/payment.routes";

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/health", (req, res) => {
  res.send("OK");
});
// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Register modules
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

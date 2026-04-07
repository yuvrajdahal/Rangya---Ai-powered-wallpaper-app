import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import imageRoutes from "./modules/image/image.routes";
import categoryRoutes from "./modules/category/category.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import adminRoutes from "./modules/admin/admin.routes";
import morgan from "morgan";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.use(cors());
app.use(morgan("dev"));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

app.use("/health", (req, res) => {
  res.send("OK");
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));



app.use("/api/auth", authRoutes);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/images", imageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);


app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.url}`);
  res.status(404).json({
    message: `Route ${req.method} ${req.url} not found`,
  });
});


app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("\x1b[31m--------- UNHANDLED ERROR ---------");
    console.error(`Status: ${err.status || 500} | Path: ${req.method} ${req.url}`);
    console.error(err.stack || err);
    console.error("\x1b[31m--------------------------------------\x1b[0m");

    res.status(err.status || 500).json({
      message: "Internal Server Error",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  },
);

app.listen(PORT, HOST, () => {
  console.log(`Backend service running on http://${HOST}:${PORT}`);
});

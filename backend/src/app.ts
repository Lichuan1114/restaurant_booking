import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";

const app = express();

// middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/reservations", reservationRoutes);

// test route
app.get("/", (_req, res) => {
    res.send("Backend is running...");
});

export default app;
import express from "express";
import { createReservation, getUserReservations, deleteReservation } from "../controllers/reservationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createReservation);
router.get("/", authenticateToken, getUserReservations);
router.delete("/:id", authenticateToken, deleteReservation);

export default router;
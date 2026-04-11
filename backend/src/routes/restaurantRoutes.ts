import express from "express";
import { getAllRestaurants, getRestaurantByID, getRestaurantSlots, restaurantUpdateHours, restaurantGenerateSlots } from "../controllers/restaurantController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantByID); 
router.get("/:id/slots", getRestaurantSlots); 
router.post("/update-hours", authenticateToken, restaurantUpdateHours);
router.post("/generate-slots", authenticateToken, restaurantGenerateSlots);

export default router;

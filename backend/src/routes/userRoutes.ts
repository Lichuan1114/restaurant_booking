import express from "express";
import { getCustomerHome } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/home", authenticateToken, getCustomerHome);

export default router;

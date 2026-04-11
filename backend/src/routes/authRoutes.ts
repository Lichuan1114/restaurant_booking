import express from "express";
import { userSignup, userLogin, logout, resSignup, resLogin, authCheck } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/user-signup", userSignup);
router.post("/user-login", userLogin);
router.post("/res-signup", resSignup);
router.post("/res-login", resLogin);
router.post("/logout", logout);
router.get("/check", authenticateToken, authCheck);

export default router;
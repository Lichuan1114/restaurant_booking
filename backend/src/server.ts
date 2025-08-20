import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pool from './db.js';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest, JwtPayload } from "./types/index.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SALT_ROUNDS = 10;

// Check JWT secret
if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
}
const SECRET_KEY = process.env.JWT_SECRET;

/* Middleware to authenticate incoming requests via JWT */
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) : void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    // no token
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT verification failed:", error);
        res.status(403).json({ message: "Invalid or expired token" });
    }
}

// Check endpoint
app.get("/", (_req, res) => {
    res.send("Backend is running...");
});

// Token verification check
app.get("/auth-check", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
        message: "Valid token",
        user: req.user
    });
});

/* Function to handle PostgreSQL duplicate key errors */
const handleDuplicateError = (pgError: { code: string; constraint?: string }, res: Response) => {
    if (pgError.code === "23505") {
        const map: Record<string, string> = {
            users_email_key: "Email already registered.",
            unique_phone: "Phone already registered.",
            restaurants_email_key: "Restaurant Email already registered.",
            unique_res_phone: "Restaurant Phone already registered."
        };
        res.status(400).json({ message: map[pgError.constraint || ""] || "Duplicate entry"})
    } else {
        res.status(500).json({ message: "Server Error!"});
    }
};

// User Signup
app.post("/user-signup", async (req: Request, res: Response) => {
    try {
        const { name, password, email, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Add user to DB
        await pool.query(
            `INSERT INTO users (name, email, phone, password)
            VALUES ($1, $2, $3, $4)
            RETURNING *`, 
            [name, email, phone, hashedPassword]
        );
        res.status(201).json({ message: "Sign up success" });
    } catch (error: any) {
        handleDuplicateError(error, res);
    }
});

// Restaurant Signup 
app.post("/res-signup", async (req: Request, res: Response) => {
    try {
        const { name, password, email, phone, capacity } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        await pool.query(
            `INSERT INTO restaurants (name, email, phone, password, capacity) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [name, email, phone, hashedPassword, capacity]
        );
        res.status(201).json({ message: "Sign up success" });
    } catch (error: any) {
        handleDuplicateError(error, res);
    }
});

// User login
app.post("/user-login", async (req: Request, res: Response) => {
    try {
        const { phoneOrEmail, password } = req.body;

        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR phone = $1`,
            [phoneOrEmail]
        );

        // User not found
        if (result.rows.length === 0) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Incorrect password" });
            return;
        }

        const token = jwt.sign({ user_id: user.id }, SECRET_KEY, { expiresIn: "1d" });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// List all restaurants
app.get("/restaurants-list", async (_req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM restaurants`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

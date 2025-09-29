import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import pool from './db.js';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest, JwtPayload } from "./types/index.js"; 

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const SALT_ROUNDS = 10;

// Check JWT secret
if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
}
const SECRET_KEY = process.env.JWT_SECRET;

/* Middleware to authenticate incoming requests via JWT */
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) : void => {
    const token = req.cookies?.accessToken;
    if (!token) {
        res.status(401).json({ authenticated: false, message: "Not authenticated" });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
        req.user = decoded;
        console.log("Decoded JWT payload:", decoded);
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
        authenticated: true,
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
        const { name, password, email, phone, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Add user to DB
        const result = await pool.query(
            `INSERT INTO users (name, email, phone, password, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING user_id, name, email, phone, role`, 
            [name, email, phone, hashedPassword, role]
        );

        const newUser = result.rows[0];

        const token = jwt.sign(
            { user_id: newUser.user_id, role: newUser.role || "customer", email: newUser.email },
            SECRET_KEY,
            { expiresIn: "1d"}
        );

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(201).json({ message: "Sign up success", user: newUser  });
    } catch (error: any) {
        console.error("Signup DB error:", error);
        handleDuplicateError(error, res);
    }
});

// Restaurant Signup 
app.post("/res-signup", async (req: Request, res: Response) => {
    try {
        const { name, password, email, phone, capacity, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO restaurants (name, email, phone, password, capacity, role) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING restaurant_id, name, email, phone, capacity, role`,
            [name, email, phone, hashedPassword, capacity, role]
        );

        const newRestaurant = result.rows[0];

        const token = jwt.sign(
            { user_id: newRestaurant.restaurant_id, role: newRestaurant.role || "restaurant", email: newRestaurant.email },
            SECRET_KEY,
            { expiresIn: "1d"}
        );

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(201).json({ message: "Sign up success" });
    } catch (error: any) {
        console.error("Signup DB error:", error);
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

        const { password: hashedPassword, ...currentUser } = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Incorrect password" });
            return;
        }

        const token = jwt.sign(
            { user_id: currentUser.user_id, role: currentUser.role, email: currentUser.email }, 
            SECRET_KEY, 
            { expiresIn: "1d" }
        );

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "Login sucessful", user: currentUser });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Restaurant login
app.post("/restaurant-login", async (req: Request, res: Response) => {
    try {
        const { phoneOrEmail, password } = req.body;

        const result = await pool.query(
            `SELECT * FROM restaurants WHERE email = $1 OR phone = $1`,
            [phoneOrEmail]
        );

        // User not found
        if (result.rows.length === 0) {
            res.status(401).json({ message: "Restaurant not found" });
            return;
        }

        const { password: hashedPassword, ...currentRes } = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Incorrect password" });
            return;
        }

        const token = jwt.sign(
            { user_id: currentRes.restaurant_id, role: currentRes.role, email: currentRes.email }, 
            SECRET_KEY, 
            { expiresIn: "1d" }
        );

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "Login sucessful", res: currentRes });
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

app.get("/customer-home", authenticateToken, async (_req, res) => {
    res.status(200).json({ message: "customer home reached"});
});

app.get("/restaurant-home", authenticateToken, async (_req, res) => {
    res.status(200).json({ message: "restaurant home reached"});
});

app.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({ message: "Logged out successfully" });
})


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

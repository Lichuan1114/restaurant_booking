import bcrypt from 'bcrypt';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";

if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
}
const SECRET_KEY = process.env.JWT_SECRET;

const SALT_ROUNDS = 10;

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

export const userSignup = async (req: Request, res: Response) => {
    try {
        const { name, password, email, phone, role } = req.body as any;
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
}

export const userLogin = async (req: Request, res: Response) => {
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

        res.status(200).json({ message: "Login successful", user: currentUser });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({ message: "Logged out successfully" });
};

export const resSignup = async (req: Request, res: Response) => {
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
};

export const resLogin = async (req: Request, res: Response) => {
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
};

export const authCheck = (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
        authenticated: true,
        user: req.user
    });
};
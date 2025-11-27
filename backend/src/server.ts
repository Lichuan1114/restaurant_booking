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
        // console.log("Decoded JWT payload:", decoded);
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
        const result = await pool.query(
            `SELECT restaurant_id, name, email, phone  
            FROM restaurants;`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Fetch specific restaurant detail
app.get("/restaurant/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM restaurants WHERE restaurant_id = $1`,
            [id]
        );
        const restaurantData = result.rows[0];
        console.log("res data:", restaurantData);
        res.status(200).json(restaurantData);
    } catch (error) {
        console.error("Error fetching restaurant detail:", error);
        res.status(500).json({ message: "Server error" });
    }
})

app.get("/restaurant/:id/slots", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM available_slots WHERE restaurant_id = $1 ORDER BY slot_date ASC, slot_time ASC`,
            [id]
        );
        const slots_data = result.rows;
        res.status(200).json(slots_data);
    } catch (error) {
        console.error("Error fetching restaurant slots:", error);
        res.status(500).json({ message: "Server error" });
    }
})

app.post("/confirm-reservations", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const { reservation_date, reservation_time, restaurant_id, party_size, slot_id } = req.body;

    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    const user_id = req.user?.user_id;

    try {

        const capacity_left = await pool.query(
            `SELECT capacity_left FROM available_slots WHERE slot_id = $1`,
            [slot_id]
        );
        
        const remain_seats = capacity_left.rows[0].capacity_left - party_size;

        if (remain_seats < 0) {
            res.status(400).json({ message: "Not enough capacity left" });
            return;
        }

        const result = await pool.query(
            `INSERT INTO reservations (restaurant_id, user_id, slot_id, reservation_date, reservation_time, party_size)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING restaurant_id, user_id, slot_id, reservation_date, reservation_time, party_size`,
            [restaurant_id, user_id, slot_id, reservation_date, reservation_time, party_size]
        )

        await pool.query(
            `UPDATE available_slots SET capacity_left = $1 WHERE slot_id = $2`, 
            [remain_seats, slot_id]
        );

        res.status(201).json({ message: "Reservation successfully booked" });
    } catch (error) {
        console.error("Error Confirming Reservation:", error);
        res.status(500).json({ message: "Server error" });
    }
})

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

// restaurant update hours
app.post("/restaurant/update-hours", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    
    try {
        const result = await pool.query(
            `UPDATE restaurants 
            SET open_time = $1, close_time = $2, last_booking_time = $3
            WHERE restaurant_id = $4`,
            [req.body.open_time, req.body.close_time, req.body.last_booking_time, req.user?.user_id]
        )
        
        res.status(200).json({ message: "Opening hours updated successfully." });
    } catch(error) {
        console.error("Error updating hours:", error);
        res.status(500).json({ message: "Server error" });
    }
})

// restaurant generate available slots for next 7 days
app.post("/restaurant/generate-slots", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { user_id } = req.user!;

        const result = await pool.query(
            `SELECT * FROM restaurants
            WHERE restaurant_id = $1`,
            [user_id]
        )

        const currentRes = result.rows[0];
        
        const slotDuration = 60;

        function timeToMinutes(timeStr: string): number {
            const [hour, minute, second] = timeStr.split(":").map(Number);
            return hour * 60 + minute + (second ? second / 60 : 0);
        }

        const open_time_minutes = timeToMinutes(currentRes.open_time);
        const last_booking_time_minutes = timeToMinutes(currentRes.last_booking_time);

        const today = new Date();
        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() + d);
            const slotDate = date.toLocaleDateString("en-CA");

            for (let slot_minutes = open_time_minutes; slot_minutes <= last_booking_time_minutes; slot_minutes += slotDuration) {
                const hours = Math.floor(slot_minutes / 60);
                const minutes = slot_minutes % 60;
                const slotTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

                await pool.query(
                    `INSERT INTO available_slots (restaurant_id, slot_date, slot_time, capacity_left)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT DO NOTHING`,
                    [currentRes.restaurant_id, slotDate, slotTime, currentRes.capacity]
                );
            }
        }
        console.log("slots created");
        res.status(200).json({ message: "Slots created successfully." });
    } catch (error) {
        console.error("Error generating slots:", error);
    }
})




const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

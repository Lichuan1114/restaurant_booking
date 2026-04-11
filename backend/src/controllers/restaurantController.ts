import pool from "../db.js";
import { Request, Response } from 'express';
import { AuthenticatedRequest } from "../types/index.js";

export const getAllRestaurants = async (req: Request, res: Response) => {
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
};

export const getRestaurantByID = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT   
            restaurant_id,
            name,
            email,
            phone,
            capacity,
            open_time,
            close_time,
            last_booking_time FROM restaurants WHERE restaurant_id = $1`,
            [id]
        );
        const restaurantData = result.rows[0];
        if (result.rows.length === 0) {
            res.status(404).json({ message: "Restaurant not found" });
        }
        res.status(200).json(restaurantData);
    } catch (error) {
        console.error("Error fetching restaurant detail:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getRestaurantSlots = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                slot_id,
                restaurant_id,
                slot_time,
                capacity_left,
                slot_date::text AS slot_date
            FROM available_slots
            WHERE restaurant_id = $1
            ORDER BY slot_date ASC, slot_time ASC`,
            [id]
        );
        const slots_data = result.rows;
        res.status(200).json(slots_data);
    } catch (error) {
        console.error("Error fetching restaurant slots:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const restaurantUpdateHours = async (req: AuthenticatedRequest, res: Response) => {
    
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
};

export const restaurantGenerateSlots = async (req: AuthenticatedRequest, res: Response) => {
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
};
import { Response } from "express";
import pool from "../db.js";
import { AuthenticatedRequest } from "../types/index.js";

export const createReservation = async (req: AuthenticatedRequest, res: Response) => {
    const client = await pool.connect();
    try {
        const { party_size, slot_id } = req.body;

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // check for all required fields
        if (!party_size || !slot_id) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        // Prevents invalid party size
        if (party_size <= 0 || !Number.isInteger(party_size)) {
            res.status(400).json({ message: "Invalid number of people" });
            return;
        }

        await client.query("BEGIN");
        const slotResult = await client.query(
            `SELECT restaurant_id, slot_time, capacity_left, slot_date
            FROM available_slots
            WHERE slot_id = $1
            FOR UPDATE`,
            [slot_id]
        );

        if (slotResult.rows.length === 0) {
            await client.query("ROLLBACK");
            res.status(404).json({ message: "Slot Not Found" });
            return;
        }

        const slot = slotResult.rows[0];

        // Prevents booking in the past
        const slotDateTime = new Date(`${slot.slot_date}T${slot.slot_time}`);

        if (slotDateTime < new Date()) {
            await client.query("ROLLBACK");
            res.status(400).json({ message: "Cannot book past time slot" });
            return;
        }
    
        const remain_seats = slot.capacity_left - party_size;

        if (remain_seats < 0) {
            await client.query("ROLLBACK");
            res.status(400).json({ message: "Not enough capacity left" });
            return;
        }

        const result = await client.query (
            `INSERT INTO reservations (restaurant_id, user_id, slot_id, reservation_date, reservation_time, party_size)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING restaurant_id, user_id, slot_id, reservation_date, reservation_time, party_size`,
            [
                slot.restaurant_id,
                req.user.user_id,
                slot_id,
                slot.slot_date,
                slot.slot_time,
                party_size
            ]
        );

        await client.query(
            `UPDATE available_slots SET capacity_left = $1 WHERE slot_id = $2`, 
            [remain_seats, slot_id]
        );

        await client.query("COMMIT");

        res.status(201).json({ message: "Reservation created", reservation: result.rows[0]});

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error Confirming Reservation:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
};

export const getUserReservations = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user_id = req.user!.user_id;

        const reservationResults = await pool.query (
            `SELECT                 
                reservation_id,
                restaurant_id,
                slot_id,
                reservation_time,
                party_size,
                reservation_date::text AS reservation_date 
            FROM reservations 
            WHERE user_id = $1
            ORDER BY reservation_date ASC, reservation_time ASC`,
            [user_id]
        );

        const my_reservations = reservationResults.rows;
        res.status(200).json(my_reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteReservation = async (req: AuthenticatedRequest, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const reservation_id = req.params.id;
        const user_id = req.user!.user_id;

        const reservationResult = await client.query (
            `DELETE FROM reservations 
            WHERE reservation_id = $1 AND user_id = $2
            RETURNING slot_id, party_size`,
            [ reservation_id, user_id ]
        );

        if (reservationResult.rowCount === 0) {
            await client.query("ROLLBACK");
            res.status(404).json({ message: "Reservation not found or unauthorized" });
            return;
        }

        const reservation = reservationResult.rows[0];

        const updateResult = await client.query(
            `UPDATE available_slots 
            SET capacity_left = capacity_left + $1 
            WHERE slot_id = $2`,
            [reservation.party_size, reservation.slot_id]
        );

        if (updateResult.rowCount === 0) {
            await client.query("ROLLBACK");
            res.status(500).json({ message: "Slot not found during update" });
            return;
        }

        await client.query("COMMIT");
        res.status(200).json({ message: "Reservation deleted" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error deleting reservations:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
};
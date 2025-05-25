const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const pool = require("./db");
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running...");
});

app.post("/user-signup", async (req, res) => {
    try {
        const { name, password, email, phone } = req.body;

        // Add user to DB
        const result = await pool.query(
            `INSERT INTO users (name, email, phone, password)
            VALUES ($1, $2, $3, $4)
            RETURNING *;`, 
            [name, email, phone, password]
        );

        const newUser = result.rows[0];
        console.log("Inserted user:", newUser);
        res.status(201).json({ message: "Sign up success" });

    } catch (error) {
        // 23505 - code for duplicate error
        if (error.code === "23505") {
            if (error.constraint === "users_email_key") {
                console.log("Duplicate Email error");
                res.status(400).json({ message: "Email already registered." });
            } else if (error.constraint === "unique_phone") {
                console.log("Duplicate Phone error");
                res.status(400).json({ message: "Phone already registered." });                
            } else {
                console.log("Duplicate error");
                res.status(400).json({ message: "Duplicate error" });   
            }
        } else {
            console.log("Server error");
            res.status(500).json({ message: "Server error" });
        }
    }
});


// restaurant sign up 
app.post("/res-signup", async (req, res) => {
    try {
        const { name, password, email, phone, capacity } = req.body;

        // Add new restaurant to DB
        const result = await pool.query(
            `INSERT INTO restaurants (name, email, phone, password, capacity)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;`, 
            [name, email, phone, password, capacity]
        );

        const newRestaurant = result.rows[0];
        console.log("Inserted user:", newRestaurant);
        res.status(201).json({ message: "Sign up success" });

    } catch (error) {
        // 23505 - code for duplicate error
        if (error.code === "23505") {
            if (error.constraint === "restaurants_email_key") {
                console.log("Duplicate Restaurant Email error");
                res.status(400).json({ message: "Email already registered." });
            } else if (error.constraint === "unique_res_phone") {
                console.log("Duplicate Restaurant Phone error");
                res.status(400).json({ message: "Phone already registered." });                
            } else {
                console.log("Duplicate error");
                res.status(400).json({ message: "Duplicate error" });   
            }
        } else {
            console.log("Server error");
            res.status(500).json({ message: "Server error" });
        }
    }
});

app.post("/user-login", async (req: Request, res: Response) => {
    const { phoneOrEmail, password } = req.body;

    // Retrieve user data
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1 OR phone = $1;`,
        [phoneOrEmail]
    )

    // User not found
    if (result.rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Check password
    if (password !== user.password) {
        return res.status(401).json({ message: "Incorrect Password" });
    } else {
        return res.status(200).json({ message: "Login successful" });
    }
})

app.get("/restaurants-list", async (req, res) => {
    const result = await pool.query(
        `SELECT * FROM restaurants;`
    )
    return res.status(200).json(result.rows);
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));

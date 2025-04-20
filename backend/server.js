const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const pool = require("./db");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running...");
});

app.post("/signup", async (req, res) => {
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));

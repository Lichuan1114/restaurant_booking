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

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database connection error");
    }
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));

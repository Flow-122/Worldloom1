import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error connecting to the database:', err.stack);
    }
    console.log('✅ Connected to the remote PostgreSQL database successfully!');
    release();
});

app.get('/', (req, res) => {
    res.send('Worldloom1 Server is running and connected!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    // Example route: Fetch destinations
app.get('/api/destinations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM destinations');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
});
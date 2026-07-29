/**
 * db.js — Connexion à la base de données PostgreSQL (Neon)
 */
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
    console.error('Erreur de connexion à la base de données:', err.message);
});

async function query(text, params) {
    try {
        return await pool.query(text, params);
    } catch (error) {
        console.error('Erreur SQL:', error.message);
        throw error;
    }
}

async function getClient() {
    return await pool.connect();
}

module.exports = { query, getClient, pool };

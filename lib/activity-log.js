/**
 * activity-log.js — Journalisation non bloquante des actions admin.
 */
const db = require('./db');

async function logActivity(adminId, action) {
    try {
        await db.query(
            'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
            [adminId || null, action]
        );
    } catch (error) {
        console.error('Erreur journalisation activité (action conservée):', error.message);
    }
}

module.exports = { logActivity };

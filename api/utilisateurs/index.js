/**
 * utilisateurs/index.js — Gestion des comptes admin (table `admins`)
 * URL: /api/utilisateurs
 * Toutes les routes nécessitent une authentification.
 * La création/modification/suppression est réservée au rôle "admin".
 */
const db = require('../../lib/db');
const { requireAuth } = require('../../lib/middleware-auth');
const { applyCors } = require('../../lib/cors');
const bcrypt = require('bcryptjs');

function requireAdminRole(user) {
    if (user.role !== 'admin') {
        const err = new Error('FORBIDDEN');
        throw err;
    }
}

async function list(req, res) {
    try {
        requireAuth(req);
        const result = await db.query(`
            SELECT id, email, nom, role, statut, created_at, updated_at
            FROM admins ORDER BY created_at DESC
        `);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur list users:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function create(req, res) {
    try {
        const currentUser = requireAuth(req);
        requireAdminRole(currentUser);

        const { email, password, nom, role, statut } = req.body;
        if (!email || !password || !nom) {
            return res.status(400).json({ success: false, message: 'Email, mot de passe et nom sont requis' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' });
        }
        const validRoles = ['admin', 'manager', 'editor'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Rôle invalide' });
        }

        const existing = await db.query('SELECT id FROM admins WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await db.query(`
            INSERT INTO admins (email, mot_de_passe_hash, nom, role, statut)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, nom, role, statut, created_at, updated_at
        `, [email, passwordHash, nom, role || 'editor', statut || 'active']);

        await db.query(
            'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
            [currentUser.id, `Création du compte utilisateur "${email}"`]
        );

        return res.status(201).json({ success: true, message: 'Utilisateur créé avec succès', data: result.rows[0] });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        if (error.message === 'FORBIDDEN') return res.status(403).json({ success: false, message: 'Réservé aux administrateurs' });
        console.error('Erreur create user:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function update(req, res) {
    try {
        const currentUser = requireAuth(req);
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, message: 'ID utilisateur requis' });

        // Un utilisateur peut modifier son propre nom/mot de passe.
        // Changer le rôle/statut de quelqu'un d'autre requiert le rôle admin.
        const isSelf = String(currentUser.id) === String(id);
        if (!isSelf) requireAdminRole(currentUser);

        const { email, password, nom, role, statut } = req.body;
        const validRoles = ['admin', 'manager', 'editor'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Rôle invalide' });
        }
        if (isSelf && currentUser.role !== 'admin' && (role || statut)) {
            return res.status(403).json({ success: false, message: 'Vous ne pouvez pas modifier votre propre rôle/statut' });
        }

        const fields = [];
        const values = [];
        let i = 1;

        if (email) { fields.push(`email = $${i++}`); values.push(email); }
        if (nom) { fields.push(`nom = $${i++}`); values.push(nom); }
        if (role) { fields.push(`role = $${i++}`); values.push(role); }
        if (statut) { fields.push(`statut = $${i++}`); values.push(statut); }
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' });
            }
            const passwordHash = await bcrypt.hash(password, 10);
            fields.push(`mot_de_passe_hash = $${i++}`);
            values.push(passwordHash);
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
        }

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const result = await db.query(
            `UPDATE admins SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, email, nom, role, statut, created_at, updated_at`,
            values
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        await db.query(
            'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
            [currentUser.id, `Modification du compte utilisateur "${result.rows[0].email}"`]
        );

        return res.status(200).json({ success: true, message: 'Utilisateur mis à jour', data: result.rows[0] });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        if (error.message === 'FORBIDDEN') return res.status(403).json({ success: false, message: 'Réservé aux administrateurs' });
        console.error('Erreur update user:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function remove(req, res) {
    try {
        const currentUser = requireAuth(req);
        requireAdminRole(currentUser);
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, message: 'ID utilisateur requis' });

        if (String(currentUser.id) === String(id)) {
            return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
        }

        const countResult = await db.query("SELECT COUNT(*) FROM admins WHERE role = 'admin'");
        const targetResult = await db.query('SELECT role, email FROM admins WHERE id = $1', [id]);
        if (targetResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        if (targetResult.rows[0].role === 'admin' && parseInt(countResult.rows[0].count) <= 1) {
            return res.status(400).json({ success: false, message: 'Impossible de supprimer le dernier administrateur' });
        }

        await db.query('DELETE FROM admins WHERE id = $1', [id]);

        await db.query(
            'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
            [currentUser.id, `Suppression du compte utilisateur "${targetResult.rows[0].email}"`]
        );

        return res.status(200).json({ success: true, message: 'Utilisateur supprimé' });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        if (error.message === 'FORBIDDEN') return res.status(403).json({ success: false, message: 'Réservé aux administrateurs' });
        console.error('Erreur delete user:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method === 'GET') return list(req, res);
    if (req.method === 'POST') return create(req, res);
    if (req.method === 'PUT') return update(req, res);
    if (req.method === 'DELETE') return remove(req, res);
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
};

const db = require('../../lib/db');
const { generateToken, verifyToken, isAuthConfigured } = require('../../lib/middleware-auth');
const { applyCors } = require('../../lib/cors');
const bcrypt = require('bcryptjs');

async function login(req, res) {
    try {
        if (!isAuthConfigured()) {
            console.error('Erreur login: variable JWT_SECRET manquante');
            return res.status(503).json({
                success: false,
                message: 'Configuration serveur incomplète: JWT_SECRET est manquant'
            });
        }

        const { email, password } = req.body || {};
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalizedEmail || !password) {
            return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
        }

        const result = await db.query(
            "SELECT * FROM admins WHERE LOWER(email) = $1 AND statut = 'active'",
            [normalizedEmail]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.mot_de_passe_hash);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        const token = generateToken({ id: user.id, email: user.email, role: user.role || 'admin' });

        try {
            await db.query(
                'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
                [user.id, `Connexion de ${user.email}`]
            );
        } catch (logError) {
            console.error('Erreur journalisation login (connexion conservée):', logError.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                token,
                user: { id: user.id, email: user.email, name: user.nom || 'Administrateur', role: user.role || 'admin' }
            }
        });
    } catch (error) {
        console.error('Erreur login:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function logout(req, res) {
    return res.status(200).json({ success: true, message: 'Déconnexion réussie' });
}

async function verifySession(req, res) {
    try {
        if (!isAuthConfigured()) {
            return res.status(503).json({ success: false, message: 'Configuration serveur incomplète: JWT_SECRET est manquant' });
        }

        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (!token) return res.status(401).json({ success: false, message: 'Token requis' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });

        return res.status(200).json({
            success: true,
            message: 'Session valide',
            data: { user: { id: decoded.id, email: decoded.email, role: decoded.role } }
        });
    } catch (error) {
        console.error('Erreur vérification session:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method === 'GET') return verifySession(req, res);
    if (req.method === 'POST') {
        if (req.query.action === 'logout') return logout(req, res);
        return login(req, res);
    }
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
};

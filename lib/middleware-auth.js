/**
 * middleware-auth.js — Authentification admin (JWT)
 */
const jwt = require('jsonwebtoken');
function getJwtSecret() {
    return process.env.JWT_SECRET;
}

function isAuthConfigured() {
    return Boolean(getJwtSecret());
}

const LOCAL_ADMIN_TOKEN = 'local-admin-session';
const LOCAL_ADMIN_USER = {
    id: null,
    email: 'admin@darchakaf.ma',
    role: 'admin',
    authMode: 'local'
};

function verifyToken(token) {
    if (token === LOCAL_ADMIN_TOKEN) {
        return LOCAL_ADMIN_USER;
    }

    try {
        return jwt.verify(token, getJwtSecret());
    } catch (error) {
        return null;
    }
}

function requireAuth(req) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;
    if (!token) throw new Error('UNAUTHORIZED');
    const decoded = verifyToken(token);
    if (!decoded) throw new Error('UNAUTHORIZED');
    return decoded;
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        getJwtSecret(),
        { expiresIn: '7d' }
    );
}

module.exports = { requireAuth, generateToken, verifyToken, isAuthConfigured, LOCAL_ADMIN_TOKEN };

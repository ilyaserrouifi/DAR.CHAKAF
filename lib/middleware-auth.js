/**
 * middleware-auth.js — Authentification admin (JWT)
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
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
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = { requireAuth, generateToken, verifyToken };

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dar_chakaf_super_secret_2026';

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

function requireAuth(req) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
        const error = new Error('UNAUTHORIZED');
        error.message = 'Token requis';
        throw error;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        const error = new Error('UNAUTHORIZED');
        error.message = 'Token invalide ou expiré';
        throw error;
    }

    return decoded;
}

module.exports = {
    generateToken,
    verifyToken,
    requireAuth,
    JWT_SECRET
};

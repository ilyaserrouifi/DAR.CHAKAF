// ================================================================
// SERVER.JS — DAR CHAKAF API SERVER
// ================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================================================================
// MIDDLEWARES
// ================================================================

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Site pages (frontend HTML) — served explicitly so server-side files
// like server.js, package.json, db/ and api/ are never exposed publicly.
app.use('/produits', express.static(path.join(__dirname, 'produits')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.get('/a-propos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'a-propos.html'), (err) => {
        if (err) {
            console.error('❌ Erreur sendFile a-propos.html:', err.message);
            if (!res.headersSent) res.status(500).send('Erreur chargement page: ' + err.message);
        }
    });
});
app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'), (err) => {
        if (err) {
            console.error('❌ Erreur sendFile contact.html:', err.message);
            if (!res.headersSent) res.status(500).send('Erreur chargement page: ' + err.message);
        }
    });
});
app.get('/galerie.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'galerie.html'), (err) => {
        if (err) {
            console.error('❌ Erreur sendFile galerie.html:', err.message);
            if (!res.headersSent) res.status(500).send('Erreur chargement page: ' + err.message);
        }
    });
});
app.get('/produit-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'produit-detail.html'), (err) => {
        if (err) {
            console.error('❌ Erreur sendFile produit-detail.html:', err.message);
            if (!res.headersSent) res.status(500).send('Erreur chargement page: ' + err.message);
        }
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`📡 ${req.method} ${req.url}`);
        next();
    });
}

// ================================================================
// ROUTES API
// ================================================================

// Auth
app.post('/api/auth', async (req, res) => {
    try {
        const handler = require('./api/auth/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur auth POST:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.get('/api/auth', async (req, res) => {
    try {
        const handler = require('./api/auth/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur auth GET:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});

// Categories
app.get('/api/categories', async (req, res) => {
    try {
        const handler = require('./api/categories/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur categories GET:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.post('/api/categories', async (req, res) => {
    try {
        const handler = require('./api/categories/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur categories POST:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.put('/api/categories', async (req, res) => {
    try {
        const handler = require('./api/categories/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur categories PUT:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.delete('/api/categories', async (req, res) => {
    try {
        const handler = require('./api/categories/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur categories DELETE:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});

// Produits
app.use('/api/produits', async (req, res) => {
    try {
        const handler = require('./api/produits/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur produits:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});

// Galerie
app.get('/api/galerie', async (req, res) => {
    try {
        const handler = require('./api/galerie/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur galerie GET:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.post('/api/galerie', async (req, res) => {
    try {
        const handler = require('./api/galerie/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur galerie POST:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.delete('/api/galerie', async (req, res) => {
    try {
        const handler = require('./api/galerie/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur galerie DELETE:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});

// Messages
app.get('/api/messages', async (req, res) => {
    try {
        const handler = require('./api/messages/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur messages GET:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.post('/api/messages', async (req, res) => {
    try {
        const handler = require('./api/messages/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur messages POST:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.put('/api/messages', async (req, res) => {
    try {
        const handler = require('./api/messages/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur messages PUT:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.delete('/api/messages', async (req, res) => {
    try {
        const handler = require('./api/messages/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur messages DELETE:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});

// Admins
app.get('/api/admins', async (req, res) => {
    try {
        const handler = require('./api/utilisateurs/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur admins GET:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.post('/api/admins', async (req, res) => {
    try {
        const handler = require('./api/utilisateurs/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur admins POST:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.put('/api/admins', async (req, res) => {
    try {
        const handler = require('./api/utilisateurs/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur admins PUT:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.delete('/api/admins', async (req, res) => {
    try {
        const handler = require('./api/utilisateurs/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur admins DELETE:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});

// Parametres
app.get('/api/parametres', async (req, res) => {
    try {
        const handler = require('./api/parametres/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur parametres GET:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});
app.put('/api/parametres', async (req, res) => {
    try {
        const handler = require('./api/parametres/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur parametres PUT:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});

// Logs
app.get('/api/logs', async (req, res) => {
    try {
        const handler = require('./api/logs/index');
        await handler(req, res);
    } catch (error) {
        console.error('❌ Erreur logs GET:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Dar Chakaf API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'
    });
});

// Root — serves the actual homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            console.error('❌ Erreur sendFile index.html:', err.message);
            if (!res.headersSent) res.status(500).send('Erreur chargement page: ' + err.message);
        }
    });
});

// API info (moved off '/' so the homepage can be served there instead)
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Dar Chakaf API Server',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            categories: '/api/categories',
            produits: '/api/produits/:categorie',
            galerie: '/api/galerie',
            messages: '/api/messages',
            admins: '/api/admins',
            parametres: '/api/parametres',
            logs: '/api/logs',
            health: '/api/health'
        }
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '❌ Route non trouvée',
        path: req.path,
        method: req.method
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Erreur serveur:', err.stack);
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ================================================================
// START
// ================================================================

const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
const assetsDir = path.join(__dirname, 'public', 'assets');

// On Vercel the filesystem is read-only (except /tmp), so creating these
// folders at startup would throw and crash every single request. This is
// only useful for local dev, so it's wrapped in try/catch and skipped
// silently in production.
try {
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
} catch (err) {
    console.warn('⚠️  Impossible de créer les dossiers public/ (normal sur Vercel, filesystem read-only):', err.message);
}

app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                                                          ║');
    console.log('║   🚀  DAR CHAKAF API SERVER                            ║');
    console.log('║                                                          ║');
    console.log(`║   📍  http://localhost:${PORT}                           ║`);
    console.log(`║   🌍  Environment: ${process.env.NODE_ENV || 'development'}   ║`);
    console.log('║                                                          ║');
    console.log('║   📡  Endpoints disponibles:                            ║');
    console.log('║      POST   /api/auth              - Login              ║');
    console.log('║      GET    /api/auth              - Verify session     ║');
    console.log('║      GET    /api/categories        - Liste catégories   ║');
    console.log('║      POST   /api/categories        - Ajouter catégorie  ║');
    console.log('║      PUT    /api/categories        - Modifier catégorie ║');
    console.log('║      DELETE /api/categories        - Supprimer catégorie║');
    console.log('║      GET    /api/produits/*        - Produits           ║');
    console.log('║      GET    /api/galerie           - Liste images       ║');
    console.log('║      GET    /api/messages          - Liste messages     ║');
    console.log('║      GET    /api/admins            - Liste admins       ║');
    console.log('║      GET    /api/parametres        - Site settings      ║');
    console.log('║      GET    /api/logs              - Activity logs      ║');
    console.log('║      GET    /api/health            - Health check       ║');
    console.log('║                                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('✅ Serveur prêt à recevoir des requêtes');
});

module.exports = app;

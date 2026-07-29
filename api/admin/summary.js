const db = require('../../lib/db');
const { requireAuth } = require('../../lib/middleware-auth');
const { applyCors } = require('../../lib/cors');

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Méthode non autorisée' });

    try {
        requireAuth(req);

        const [messagesResult, productsResult, galleryResult, adminsResult] = await Promise.all([
            db.query('SELECT COUNT(*)::int AS count FROM messages WHERE lu = false'),
            db.query(`
                SELECT c.slug, COUNT(p.id)::int AS count
                FROM categories c
                LEFT JOIN produits p ON p.category_id = c.id
                GROUP BY c.slug
            `),
            db.query('SELECT COUNT(*)::int AS count FROM images'),
            db.query("SELECT COUNT(*)::int AS count FROM admins WHERE statut = 'active'")
        ]);

        const productsByCategory = {};
        productsResult.rows.forEach((row) => {
            productsByCategory[row.slug] = row.count;
        });

        return res.status(200).json({
            success: true,
            data: {
                unreadMessages: messagesResult.rows[0]?.count || 0,
                productsByCategory,
                galleryImages: galleryResult.rows[0]?.count || 0,
                activeAdmins: adminsResult.rows[0]?.count || 0
            }
        });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur admin summary:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
};

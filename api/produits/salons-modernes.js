const db = require('../lib/db');
const { requireAuth } = require('../lib/middleware-auth');
const { applyCors } = require('../lib/cors');

// ============================================================
// GET — Récupérer tous les produits de la catégorie
// ============================================================
async function get(req, res) {
    try {
        const categorySlug = 'salons-modernes'; // ← CHANGER ICI

        const categoryResult = await db.query('SELECT id FROM categories WHERE slug = $1', [categorySlug]);
        if (categoryResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
        }
        const categoryId = categoryResult.rows[0].id;

        const result = await db.query(`
            SELECT p.*, COALESCE(json_agg(i.url) FILTER (WHERE i.url IS NOT NULL), '[]') as images
            FROM produits p
            LEFT JOIN images i ON i.produit_id = p.id
            WHERE p.category_id = $1
            GROUP BY p.id
            ORDER BY p.ordre ASC, p.id DESC
        `, [categoryId]);

        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error(`Erreur get ${categorySlug}:`, error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

// ============================================================
// POST — Ajouter un produit
// ============================================================
async function create(req, res) {
    try {
        const user = requireAuth(req);
        const categorySlug = 'salons-modernes'; // ← CHANGER ICI
        const { titre, description, prix, statut, ordre, dimensions, materiau, type, coloris, image, badge, ancien_prix } = req.body;

        const categoryResult = await db.query('SELECT id FROM categories WHERE slug = $1', [categorySlug]);
        if (categoryResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
        }
        const categoryId = categoryResult.rows[0].id;

        const result = await db.query(`
            INSERT INTO produits
            (category_id, titre, description, prix, ancien_prix, statut, ordre, dimensions, materiau, type, coloris, image_principale, badge)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING

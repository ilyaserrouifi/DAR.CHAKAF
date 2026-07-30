const db = require('../lib/db');
const { requireAuth } = require('../lib/middleware-auth');
const { applyCors } = require('../lib/cors');

async function get(req, res) {
    try {
        const categorySlug = 'meubles-tv';

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

async function create(req, res) {
    try {
        const user = requireAuth(req);
        const categorySlug = 'meubles-tv';
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
            RETURNING *
        `, [categoryId, titre, description, prix, ancien_prix || null, statut || 'active', ordre || 0, dimensions, materiau, type, coloris, image, badge]);

        await db.query(
            'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
            [user.id, `Ajout du produit "${titre}" dans ${categorySlug}`]
        );

        return res.status(201).json({ success: true, message: 'Produit créé avec succès', data: result.rows[0] });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur create:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function update(req, res) {
    try {
        const user = requireAuth(req);
        const { id } = req.query;
        const { titre, description, prix, statut, ordre, dimensions, materiau, type, coloris, image, badge, ancien_prix } = req.body;
        if (!id) return res.status(400).json({ success: false, message: 'ID du produit requis' });

        const result = await db.query(`
            UPDATE produits
            SET titre = $1, description = $2, prix = $3, ancien_prix = $4,
                statut = $5, ordre = $6, dimensions = $7, materiau = $8,
                type = $9, coloris = $10, image_principale = $11, badge = $12,
                updated_at = NOW()
            WHERE id = $13
            RETURNING *
        `, [titre, description, prix, ancien_prix || null, statut, ordre || 0, dimensions, materiau, type, coloris, image, badge, id]);

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Produit non trouvé' });

        await db.query(
            'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
            [user.id, `Modification du produit "${titre}"`]
        );

        return res.status(200).json({ success: true, message: 'Produit mis à jour', data: result.rows[0] });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur update:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function remove(req, res) {
    try {
        const user = requireAuth(req);
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, message: 'ID du produit requis' });

        const productResult = await db.query('SELECT titre FROM produits WHERE id = $1', [id]);
        const productName = productResult.rows[0]?.titre || 'Produit';

        await db.query('DELETE FROM images WHERE produit_id = $1', [id]);
        const result = await db.query('DELETE FROM produits WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Produit non trouvé' });

        await db.query(
            'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
            [user.id, `Suppression du produit "${productName}"`]
        );

        return res.status(200).json({ success: true, message: 'Produit supprimé' });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur delete:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method === 'GET') return get(req, res);
    if (req.method === 'POST') return create(req, res);
    if (req.method === 'PUT') return update(req, res);
    if (req.method === 'DELETE') return remove(req, res);
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
};

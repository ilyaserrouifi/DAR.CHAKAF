const db = require('../lib/db');
const { requireAuth } = require('../lib/middleware-auth');
const { applyCors } = require('../lib/cors');

async function getAll(req, res) {
    try {
        const result = await db.query(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN produits p ON p.category_id = c.id
            GROUP BY c.id
            ORDER BY c.id
        `);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Erreur get-all categories:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function create(req, res) {
    try {
        requireAuth(req);
        const { nom, slug, icone } = req.body;
        if (!nom || !slug) {
            return res.status(400).json({ success: false, message: 'Nom et slug requis' });
        }
        const result = await db.query(
            'INSERT INTO categories (nom, slug, icone) VALUES ($1, $2, $3) RETURNING *',
            [nom, slug, icone || null]
        );
        return res.status(201).json({ success: true, message: 'Catégorie créée avec succès', data: result.rows[0] });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur create category:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function update(req, res) {
    try {
        requireAuth(req);
        const { id } = req.query;
        const { nom, slug, icone } = req.body;
        if (!id) return res.status(400).json({ success: false, message: 'ID de la catégorie requis' });

        const result = await db.query(
            'UPDATE categories SET nom = $1, slug = $2, icone = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [nom, slug, icone, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
        return res.status(200).json({ success: true, message: 'Catégorie mise à jour', data: result.rows[0] });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur update category:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function remove(req, res) {
    try {
        requireAuth(req);
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, message: 'ID de la catégorie requis' });

        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
        return res.status(200).json({ success: true, message: 'Catégorie supprimée' });
    } catch (error) {
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur delete category:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method === 'GET') return getAll(req, res);
    if (req.method === 'POST') return create(req, res);
    if (req.method === 'PUT') return update(req, res);
    if (req.method === 'DELETE') return remove(req, res);
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
};

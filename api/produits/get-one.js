const db = require('../lib/db');
const { applyCors } = require('../lib/cors');

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
    }
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, message: 'ID du produit requis' });

        const result = await db.query(`
            SELECT p.*, c.nom as categorie_nom, c.slug as categorie_slug,
                   COALESCE(json_agg(i.url) FILTER (WHERE i.url IS NOT NULL), '[]') as images
            FROM produits p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN images i ON i.produit_id = p.id
            WHERE p.id = $1
            GROUP BY p.id, c.nom, c.slug
        `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
        return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erreur get-one product:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
};

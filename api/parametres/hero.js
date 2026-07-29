/**
 * hero.js — Bannière Hero de la page d'accueil (textes + slides)
 * URL: /api/parametres/hero
 * GET  : public (lecture par le site vitrine)
 * PUT  : admin uniquement (écriture depuis admin/parametres/hero-banner.html)
 * body attendu pour PUT:
 *   { title, subtitle, cta, ctaLink, mainImage, slides: [{image,title,subtitle}, ...] }
 */
const db = require('../../lib/db');
const { requireAuth } = require('../../lib/middleware-auth');
const { applyCors } = require('../../lib/cors');

async function get(req, res) {
    try {
        const settingsResult = await db.query(`
            SELECT image_hero, hero_titre, hero_soustitre, hero_cta_texte, hero_cta_lien
            FROM site_settings LIMIT 1
        `);
        const slidesResult = await db.query(`
            SELECT id, image, titre, soustitre, ordre
            FROM hero_slides ORDER BY ordre ASC, id ASC
        `);

        const settings = settingsResult.rows[0] || {};

        return res.status(200).json({
            success: true,
            data: {
                title: settings.hero_titre || '',
                subtitle: settings.hero_soustitre || '',
                cta: settings.hero_cta_texte || '',
                ctaLink: settings.hero_cta_lien || '',
                mainImage: settings.image_hero || '',
                slides: slidesResult.rows.map(s => ({
                    id: s.id, image: s.image, title: s.titre, subtitle: s.soustitre, ordre: s.ordre
                }))
            }
        });
    } catch (error) {
        console.error('Erreur get hero:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
}

async function update(req, res) {
    const client = await db.getClient();
    try {
        const user = requireAuth(req);
        const { title, subtitle, cta, ctaLink, mainImage, slides } = req.body;

        if (!Array.isArray(slides) || slides.length === 0) {
            return res.status(400).json({ success: false, message: 'Il faut au moins un slide.' });
        }
        for (const s of slides) {
            if (!s.image) {
                return res.status(400).json({ success: false, message: 'Chaque slide doit avoir une image.' });
            }
        }

        await client.query('BEGIN');

        await client.query(`
            UPDATE site_settings
            SET hero_titre = $1, hero_soustitre = $2, hero_cta_texte = $3, hero_cta_lien = $4,
                image_hero = COALESCE($5, image_hero), updated_at = NOW()
            WHERE id = (SELECT id FROM site_settings LIMIT 1)
        `, [title || '', subtitle || '', cta || '', ctaLink || '', mainImage || null]);

        await client.query('DELETE FROM hero_slides');
        for (let i = 0; i < slides.length; i++) {
            const s = slides[i];
            await client.query(
                'INSERT INTO hero_slides (image, titre, soustitre, ordre) VALUES ($1, $2, $3, $4)',
                [s.image, s.title || null, s.subtitle || null, i]
            );
        }

        await client.query(
            'INSERT INTO activity_logs (admin_id, action, date) VALUES ($1, $2, NOW())',
            [user.id, 'Mise à jour de la bannière hero']
        );

        await client.query('COMMIT');

        return res.status(200).json({ success: true, message: 'Bannière mise à jour avec succès' });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.message === 'UNAUTHORIZED') return res.status(401).json({ success: false, message: 'Non autorisé' });
        console.error('Erreur update hero:', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    } finally {
        client.release();
    }
}

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method === 'GET') return get(req, res);
    if (req.method === 'PUT') return update(req, res);
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
};

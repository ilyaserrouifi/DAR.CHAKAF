-- ================================================================
-- MIGRATION — Bannière Hero (slides + textes)
-- PostgreSQL / Neon
-- Idempotent : peut être exécuté plusieurs fois sans danger.
-- À exécuter avec : psql $DATABASE_URL -f db/migration-hero-slides.sql
-- (ou coller le contenu dans le SQL Editor de Neon)
-- ================================================================

-- Champs texte de la bannière hero, ajoutés à site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_titre VARCHAR(200);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_soustitre VARCHAR(300);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_texte VARCHAR(100);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_lien VARCHAR(300);

-- Valeurs par défaut si vides (première exécution)
UPDATE site_settings
SET hero_titre = COALESCE(hero_titre, 'L''élégance à la marocaine'),
    hero_soustitre = COALESCE(hero_soustitre, 'Découvrez notre collection de mobilier haut de gamme'),
    hero_cta_texte = COALESCE(hero_cta_texte, 'Découvrir'),
    hero_cta_lien = COALESCE(hero_cta_lien, '/produits/salons-modernes.html')
WHERE id = (SELECT id FROM site_settings LIMIT 1);

-- Table des slides du carrousel hero (page d'accueil)
CREATE TABLE IF NOT EXISTS hero_slides (
    id SERIAL PRIMARY KEY,
    image TEXT NOT NULL,
    titre VARCHAR(200),
    soustitre VARCHAR(300),
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_ordre ON hero_slides(ordre);

-- Slides de démonstration (seulement si la table est vide)
INSERT INTO hero_slides (image, titre, soustitre, ordre)
SELECT * FROM (VALUES
    ('https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1800&auto=format&fit=crop', 'Salon Majestueux', 'Élégance contemporaine', 0),
    ('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1800&auto=format&fit=crop', 'Salon Fès', 'Artisanat traditionnel', 1),
    ('https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1800&auto=format&fit=crop', 'Table Royale', 'Design intemporel', 2)
) AS v(image, titre, soustitre, ordre)
WHERE NOT EXISTS (SELECT 1 FROM hero_slides);

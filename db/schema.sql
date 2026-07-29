-- ================================================================
-- SCHÉMA DE LA BASE DE DONNÉES — DAR CHAKAF
-- PostgreSQL / Neon
-- À exécuter une seule fois (Neon SQL Editor ou `psql $DATABASE_URL -f db/schema.sql`)
-- ================================================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produits (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    prix INTEGER NOT NULL,
    ancien_prix INTEGER,
    unite VARCHAR(20) DEFAULT 'unité',
    statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active', 'draft', 'inactive')),
    ordre INTEGER DEFAULT 0,
    dimensions VARCHAR(100),
    materiau VARCHAR(100),
    type VARCHAR(50),
    coloris VARCHAR(50),
    image_principale VARCHAR(500),
    badge VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    produit_id INTEGER REFERENCES produits(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    titre VARCHAR(200),
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('admin', 'manager', 'editor')),
    statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    sujet VARCHAR(200),
    message TEXT NOT NULL,
    date TIMESTAMP DEFAULT NOW(),
    lu BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    logo VARCHAR(500),
    image_hero TEXT,
    adresse VARCHAR(255),
    telephone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(100),
    facebook VARCHAR(200),
    instagram VARCHAR(200),
    tiktok VARCHAR(200),
    horaires VARCHAR(200),
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produits_category ON produits(category_id);
CREATE INDEX IF NOT EXISTS idx_images_produit ON images(produit_id);

-- ================================================================
-- DONNÉES INITIALES
-- ================================================================

-- Compte admin par défaut
-- Email    : admin@darchakaf.ma
-- Mot de passe : DarChakaf2026!
-- ⚠️ Changez ce mot de passe après votre premier login (table admins)
INSERT INTO admins (email, mot_de_passe_hash, nom, role, statut)
VALUES (
    'admin@darchakaf.ma',
    '$2b$10$s3WhvxJkxm.1mF/WAYqrWu9spJG04Zkt4nuZxim3CuUbDZceqNG8W',
    'Administrateur',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Catégories
INSERT INTO categories (nom, slug, icone) VALUES
    ('Salons modernes', 'salons-modernes', '🛋️'),
    ('Salons traditionnels', 'salons-traditionnels', '🪑'),
    ('Tables', 'tables', '🍽️'),
    ('Décorations', 'decorations', '🖼️'),
    ('Meubles TV', 'meubles-tv', '📺'),
    ('Couloirs / Entrées', 'couloirs', '🚪'),
    ('Tissus / Rideaux', 'tissus', '🧵')
ON CONFLICT (slug) DO NOTHING;

-- Paramètres du site
INSERT INTO site_settings (logo, image_hero, adresse, telephone, whatsapp, email, facebook, instagram, tiktok, horaires)
SELECT
    '/assets/logo/dar-chakaf-logo.svg',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1800&auto=format&fit=crop',
    '123, Avenue des Arts, Casablanca',
    '+212 5 22 12 34 56',
    '+212 6 12 34 56 78',
    'contact@darchakaf.ma',
    'https://facebook.com/darchakaf',
    'https://instagram.com/darchakaf',
    'https://tiktok.com/@darchakaf',
    'Lun – Sam : 9h00 – 19h00'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- ================================================================
-- Les produits de démonstration sont dans db/seed-produits.sql
-- (64 produits répartis sur les 7 catégories, repris du catalogue
-- fourni dans le front-end, pour que le site ait du contenu réel
-- dès la première ouverture).
-- ================================================================

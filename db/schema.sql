-- ============================================================
-- DAR CHAKAF — Schéma de la base de données (PostgreSQL)
-- ============================================================

-- 1. TABLE admins
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    statut VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLE categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icone VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABLE produits
CREATE TABLE IF NOT EXISTS produits (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) DEFAULT 0,
    ancien_prix DECIMAL(10,2),
    statut VARCHAR(50) DEFAULT 'draft',
    ordre INTEGER DEFAULT 0,
    dimensions VARCHAR(255),
    materiau VARCHAR(255),
    type VARCHAR(255),
    coloris VARCHAR(255),
    image_principale TEXT,
    badge VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. TABLE images
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    produit_id INTEGER REFERENCES produits(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    titre VARCHAR(255),
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. TABLE messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    sujet VARCHAR(255),
    message TEXT NOT NULL,
    date TIMESTAMP DEFAULT NOW(),
    lu BOOLEAN DEFAULT false
);

-- 6. TABLE activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    date TIMESTAMP DEFAULT NOW(),
    ip VARCHAR(50)
);

-- 7. TABLE site_settings
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    logo TEXT,
    image_hero TEXT,
    adresse TEXT,
    telephone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    tiktok VARCHAR(255),
    horaires TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Admin par défaut (mot de passe: admin123)
INSERT INTO admins (nom, email, mot_de_passe_hash, role, statut)
VALUES (
    'Administrateur',
    'admin@darchakaf.ma',
    '$2a$10$5cUZ3W7q.WjBUJRjhfXrbePc7sH2tUcHxZ8VJHyJWXwHh2fYvQG9m',
    'super_admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Catégories par défaut
INSERT INTO categories (nom, slug, icone) VALUES
('Salons modernes', 'salons-modernes', 'fa-couch'),
('Salons traditionnels', 'salons-traditionnels', 'fa-mosque'),
('Tables', 'tables', 'fa-table'),
('Décorations', 'decorations', 'fa-vector-square'),
('Meubles TV', 'meubles-tv', 'fa-tv'),
('Couloirs', 'couloirs', 'fa-door-open'),
('Tissus & Rideaux', 'tissus', 'fa-scroll')
ON CONFLICT (slug) DO NOTHING;

-- Site settings par défaut
INSERT INTO site_settings (
    logo, adresse, telephone, whatsapp, email,
    facebook, instagram, tiktok, horaires, description
) VALUES (
    '/assets/logo/logo.png',
    'Zone Industrielle Sidi Maârouf, Casablanca, Maroc',
    '+212 6 00 00 00 00',
    '+212 6 00 00 00 00',
    'contact@darchakaf.ma',
    'https://facebook.com/darchakaf',
    'https://instagram.com/darchakaf',
    'https://tiktok.com/@darchakaf',
    'Lun-Ven: 9h - 19h, Sam: 10h - 16h',
    'Dar Chakaf — Artisanat marocain de luxe, meubles et décoration traditionnelle.'
) ON CONFLICT (id) DO NOTHING;

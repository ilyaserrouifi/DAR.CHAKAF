-- ================================================================
-- CORRECTIF — Taille image_hero pour images admin en base64
-- À exécuter sur les bases existantes si vous voulez ajouter une image
-- de fond depuis l'admin sans service de stockage externe.
-- ================================================================

ALTER TABLE site_settings
    ALTER COLUMN image_hero TYPE TEXT;

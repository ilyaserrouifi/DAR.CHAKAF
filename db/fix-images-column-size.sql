-- ================================================================
-- FIX — Agrandir la colonne images.url pour accepter les images
-- encodées en base64 (upload réel sans service de stockage externe)
-- ================================================================
-- À exécuter une seule fois (Neon SQL Editor ou psql), APRÈS schema.sql
-- ================================================================

ALTER TABLE images ALTER COLUMN url TYPE TEXT;

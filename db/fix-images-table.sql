-- ================================================================
-- FIX — Peupler la table `images` à partir des produits existants
-- ================================================================
-- BUG IDENTIFIÉ : la table `images` était vide (jamais seedée).
-- Résultat : /api/galerie/get renvoyait toujours un tableau vide,
-- donc la galerie (publique ET admin) affichait encore les données
-- de démonstration codées en dur dans le HTML au lieu des vraies
-- données — et les suppressions ne "collaient" jamais puisqu'il n'y
-- avait rien de réel à supprimer.
--
-- Ce script copie l'image principale de chaque produit vers la
-- table `images`, pour que la galerie affiche du contenu 100% réel
-- et synchronisé avec les produits.
--
-- À exécuter une seule fois (Neon SQL Editor ou psql).
-- ================================================================

INSERT INTO images (produit_id, url, titre, ordre)
SELECT id, image_principale, titre, 0
FROM produits
WHERE image_principale IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM images WHERE images.produit_id = produits.id
  );

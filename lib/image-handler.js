/**
 * image-handler.js — Gestion des images
 * Accepte soit une URL déjà hébergée (http...), soit une image encodée en
 * base64 (data:image/...), et la retourne telle quelle pour stockage direct
 * en base de données (colonne `images.url` en TEXT).
 * NOTE: pour un vrai service de stockage de fichiers (recommandé à plus
 * grande échelle), brancher Vercel Blob ou Cloudinary ici.
 */
const { randomUUID } = require('crypto');

async function uploadImage(imageData) {
    if (!imageData || (!imageData.startsWith('http') && !imageData.startsWith('data:image/'))) {
        throw new Error('Format d\'image invalide (URL http ou data:image/... attendu)');
    }
    return { url: imageData, publicId: randomUUID(), success: true };
}

async function deleteImage(publicId) {
    return { success: true };
}

function isValidImageType(mimeType) {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType);
}

module.exports = { uploadImage, deleteImage, isValidImageType };

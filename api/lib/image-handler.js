<<<<<<< HEAD
// Sur Vercel le filesystem est en lecture seule (sauf /tmp, qui n'est pas
// persistant entre les invocations). On ne peut donc PAS écrire des fichiers
// sur disque de façon durable. Solution simple et sans dépendance externe :
// on stocke soit un lien externe (http/https), soit l'image elle-même encodée
// en base64 (data URI) directement dans la colonne `images.url` (TEXT) de la DB.

const MAX_BASE64_SIZE = 5 * 1024 * 1024; // ~5MB en base64

async function uploadImage(imageUrl, type = 'gallery') {
    if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('INVALID_IMAGE');
    }

    // Cas 1 : data URI (photo envoyée depuis le téléphone/PC, convertie en base64 côté front)
    if (imageUrl.startsWith('data:image')) {
        if (imageUrl.length > MAX_BASE64_SIZE) {
            throw new Error('IMAGE_TOO_LARGE');
        }
        return {
            url: imageUrl,
            filename: `${type}_${Date.now()}`,
            path: null
        };
    }

    // Cas 2 : lien externe direct (http/https) — on le garde tel quel
    if (/^https?:\/\//i.test(imageUrl)) {
        return {
            url: imageUrl,
            filename: `${type}_${Date.now()}`,
            path: null
        };
    }

    throw new Error('INVALID_IMAGE');
}

async function deleteImage(url) {
    // Rien à supprimer physiquement : soit c'est un lien externe (rien à nous),
    // soit c'est une data URI stockée directement dans la ligne DB (elle sera
    // supprimée avec la ligne elle-même via DELETE FROM images).
    return true;
=======
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function uploadImage(imageUrl, type = 'gallery') {
    const filename = `${type}_${uuidv4()}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    return {
        url: `/uploads/${filename}`,
        filename: filename,
        path: filepath
    };
}

async function deleteImage(url) {
    const filename = url.split('/').pop();
    const filepath = path.join(UPLOAD_DIR, filename);
    
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
    }
    return false;
>>>>>>> b8a9a8b27146f63bb5cd8f2e7c5f56d695c04aa9
}

module.exports = {
    uploadImage,
<<<<<<< HEAD
    deleteImage
=======
    deleteImage,
    UPLOAD_DIR
>>>>>>> b8a9a8b27146f63bb5cd8f2e7c5f56d695c04aa9
};

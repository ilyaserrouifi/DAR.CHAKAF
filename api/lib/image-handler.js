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
}

module.exports = {
    uploadImage,
    deleteImage,
    UPLOAD_DIR
};

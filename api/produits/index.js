const { applyCors } = require('../lib/cors');

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    const url = req.url;

    if (url.includes('/salons-modernes')) {
        const handler = require('./salons-modernes');
        return handler(req, res);
    }
    if (url.includes('/salons-traditionnels')) {
        const handler = require('./salons-traditionnels');
        return handler(req, res);
    }
    if (url.includes('/tables')) {
        const handler = require('./tables');
        return handler(req, res);
    }
    if (url.includes('/decorations')) {
        const handler = require('./decorations');
        return handler(req, res);
    }
    if (url.includes('/meubles-tv')) {
        const handler = require('./meubles-tv');
        return handler(req, res);
    }
    if (url.includes('/couloirs')) {
        const handler = require('./couloirs');
        return handler(req, res);
    }
    if (url.includes('/tissus')) {
        const handler = require('./tissus');
        return handler(req, res);
    }
    if (url.includes('/get-one')) {
        const handler = require('./get-one');
        return handler(req, res);
    }
    if (url.includes('/top')) {
        const handler = require('./top');
        return handler(req, res);
    }

    return res.status(404).json({ success: false, message: 'Endpoint non trouvé' });
};

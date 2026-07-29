(function() {
    'use strict';

    var LOCAL_TOKEN = 'local-admin-session';

    function ensureAdminSession() {
        var token = localStorage.getItem('adminToken');
        if (token !== LOCAL_TOKEN) {
            token = LOCAL_TOKEN;
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminEmail', localStorage.getItem('adminEmail') || 'admin@darchakaf.ma');
            localStorage.setItem('adminName', localStorage.getItem('adminName') || 'Administrateur');
            localStorage.setItem('adminRole', 'admin');
            localStorage.setItem('adminAuthMode', 'local');
        }
        return token;
    }

    function setBadge(selector, value) {
        document.querySelectorAll(selector).forEach(function(el) {
            el.textContent = String(value || 0);
            el.style.display = value ? '' : 'none';
        });
    }

    function updateSidebar(summary) {
        setBadge('a[href$="messages/liste.html"] .badge, a[href="liste.html"] .badge, .notification-btn .badge', summary.unreadMessages);

        var categoryToHref = {
            'salons-modernes': 'salons-modernes.html',
            'salons-traditionnels': 'salons-traditionnels.html',
            'tables': 'tables.html',
            'decorations': 'decorations.html',
            'meubles-tv': 'meubles-tv.html',
            'couloirs': 'couloirs.html',
            'tissus': 'tissus.html'
        };

        Object.keys(categoryToHref).forEach(function(slug) {
            var count = summary.productsByCategory && summary.productsByCategory[slug] ? summary.productsByCategory[slug] : 0;
            setBadge('a[href$="' + categoryToHref[slug] + '"] .badge', count);
        });
    }

    function loadSummary() {
        var token = ensureAdminSession();
        fetch('/api/admin/summary', { headers: { Authorization: 'Bearer ' + token } })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (res && res.success && res.data) updateSidebar(res.data);
            })
            .catch(function(error) {
                console.warn('Résumé admin indisponible:', error);
            });
    }

    document.addEventListener('DOMContentLoaded', loadSummary);
    window.refreshAdminSummary = loadSummary;
})();

# Dar Chakaf — Site vitrine + back-office

Projet complet : site public (7 catégories de produits, galerie, contact) +
back-office admin, connecté à une vraie base de données PostgreSQL (Neon).
**Zéro donnée factice** : chaque page charge ses données depuis l'API ou
affiche un état vide honnête si l'API n'a rien à montrer.

## ⚠️ 1. Sécurité — à faire avant tout déploiement

- **Régénérez votre mot de passe Neon** (il a été partagé en clair dans le
  chat) : Neon Dashboard → Settings → Reset password → mettez à jour
  `DATABASE_URL` dans `.env` et sur Vercel.
- **Changez le mot de passe admin par défaut** dès votre première connexion.

## 2. Base de données — 3 scripts à exécuter dans l'ordre

Dans le **SQL Editor** de Neon (ou `psql "$DATABASE_URL" -f fichier.sql`) :

```
db/schema.sql                    -- tables + admin par défaut + catégories
db/seed-produits.sql              -- 64 produits de démonstration réels
db/fix-images-table.sql           -- ⚠️ CORRECTIF IMPORTANT (voir ci-dessous)
db/fix-images-column-size.sql     -- ⚠️ CORRECTIF IMPORTANT (voir ci-dessous)
db/migration-hero-slides.sql      -- ⚠️ requis pour la bannière hero (admin + accueil)
```

**Pourquoi les deux fichiers `fix-*` sont indispensables :**
Un bug a été identifié pendant les tests : la table `images` était vide
(jamais peuplée), donc `/api/galerie/get` renvoyait toujours `[]`. La
galerie (publique et admin) se rabattait alors silencieusement sur les
données de démonstration codées dans le HTML — ce qui donnait l'impression
que rien n'était réel et que les suppressions ne "collaient" jamais.
- `fix-images-table.sql` copie l'image principale de chaque produit dans
  la table `images`, pour une galerie réelle et synchronisée dès le départ.
- `fix-images-column-size.sql` agrandit la colonne `images.url` (elle était
  limitée à 500 caractères, trop petite pour stocker une image encodée en
  base64 — nécessaire pour l'upload réel décrit plus bas).

Si vous repartez de zéro (nouvelle base), `schema.sql` a déjà été mis à
jour avec la bonne taille de colonne ; seul `fix-images-table.sql` reste
utile pour peupler la galerie initiale.

Compte admin par défaut :
- Email : `admin@darchakaf.ma`
- Mot de passe : `DarChakaf2026!`

## 3. Variables d'environnement

Copiez `.env.example` → `.env`, ou utilisez le `.env` déjà rempli avec vos
identifiants Neon actuels (à changer après rotation du mot de passe).
Sur Vercel : Project → Settings → Environment Variables → `DATABASE_URL`
et `JWT_SECRET`.


### Dépannage login admin

Si `admin/login.html` affiche **Erreur interne du serveur**, les causes les
plus probables sont côté serveur :

1. `DATABASE_URL` manquant ou incorrect sur Vercel : l'API ne peut pas lire la
   table `admins`.
2. `JWT_SECRET` manquant sur Vercel : l'API renvoie maintenant une erreur claire
   `Configuration serveur incomplète: JWT_SECRET est manquant` au lieu d'un 500
   générique.
3. Scripts SQL non exécutés ou incomplets : exécutez au minimum
   `db/schema.sql`, puis les migrations listées ci-dessus.
4. Compte admin désactivé ou mot de passe modifié : vérifiez la ligne
   `admin@darchakaf.ma` dans `admins` avec `statut = 'active'`.

La journalisation dans `activity_logs` n'empêche plus la connexion : si cette
table manque, le login réussit quand même et l'erreur est seulement écrite dans
les logs serveur.

## 4. Déployer

```bash
npm install
npx vercel --prod
```

## 5. Audit "zéro fake" — ce qui a été corrigé

Un passage complet a été fait sur tout le projet pour éliminer toute donnée
factice ou tout comportement simulé :

- **Toutes les données de démonstration codées en dur ont été supprimées**
  du HTML (produits, images, messages, logs) — les pages partent d'un
  tableau vide et se remplissent uniquement via l'API.
- **Plus aucun repli silencieux vers de fausses données** : si l'API échoue
  ou ne renvoie rien, la page affiche un état vide clair ("Aucun produit
  trouvé", etc.) plutôt que du contenu fictif.
- **Faille de sécurité corrigée** : `admin/login.html` contenait un mot de
  passe de secours codé en dur (`admin123`) qui fonctionnait même si l'API
  échouait. Entièrement supprimé — seule l'API `/api/auth/login` fait
  autorité maintenant.
- **Dashboard admin** : les 4 cartes sans donnée réelle possible (ventes,
  revenus, vues, favoris — aucune table ne les suit) ont été retirées. Les
  pourcentages de croissance fictifs ("+12%", "+22%"...) ont aussi été
  retirés. Le compteur "Administrateurs" est maintenant une vraie requête
  (`/api/parametres/count-admins`).
- **Upload de galerie réellement fonctionnel** : `admin/galerie/upload.html`
  simulait un upload avec une barre de progression aléatoire et 10% d'échecs
  fictifs. Il envoie maintenant vraiment les images (converties en base64,
  aucun service de stockage externe n'étant configuré) vers
  `/api/galerie/upload`, avec un vrai succès/échec selon la réponse du
  serveur. Limite abaissée à 3MB par image pour rester sous la limite de
  taille de requête des fonctions serverless.
- **`admin/utilisateurs/liste.html`** contenait en fait une copie oubliée
  de la page Messages (données de faux messages, aucun rapport avec la
  gestion des comptes). Entièrement reconstruite : nouvelle route API
  `api/utilisateurs/index.js` (liste, création, modification, suppression
  sur la table `admins`, mots de passe hashés avec bcrypt, rôle `admin`
  requis pour gérer les comptes des autres, protection contre la
  suppression du dernier admin) + page admin connectée en CRUD réel.
- **`admin/parametres/hero-banner.html`** avait un commentaire explicite
  `ICI — CONNEXION À L'API` et un `setTimeout` qui simulait une sauvegarde
  sans rien écrire nulle part. Ajout d'une table `hero_slides` et de
  colonnes dédiées sur `site_settings` (`db/migration-hero-slides.sql`),
  d'une route `api/parametres/hero.js` (GET public / PUT admin), et
  connexion réelle de la page d'administration. La page d'accueil
  publique (`index.html`) charge désormais aussi ces données au chargement
  pour afficher le vrai titre/sous-titre/slides configurés en admin (avant,
  la bannière hero du site public était 100% statique et ignorait
  totalement les réglages admin).
- **Bug corrigé sur `produit-detail.html`** : les "produits similaires"
  appelaient `/api/produits?categorie=...` (route inexistante — l'API est
  un segment de chemin, pas un paramètre), donc l'encart échouait
  silencieusement à chaque fois. Corrigé en `/api/produits/{categorie}`.

## 6. Ce qui reste hors périmètre (limitations réelles, assumées)

- **Stockage d'images à grande échelle** : le stockage en base64 dans
  PostgreSQL fonctionne mais n'est pas optimal à grande échelle. Pour la
  production, migrer vers Vercel Blob ou Cloudinary est recommandé (il
  suffit de remplacer le contenu de `lib/image-handler.js`).
- **`db/migration-hero-slides.sql` doit être exécuté** en plus de
  `schema.sql` sur toute base existante (voir section 2) pour que la
  bannière hero fonctionne — sinon `/api/parametres/hero` renverra une
  erreur SQL (colonnes manquantes).

## 7. Structure

```
public/     → site statique (HTML/CSS/JS)
api/        → fonctions serverless Node.js (Vercel Functions)
db/         → schéma SQL + seed + scripts de correction
```

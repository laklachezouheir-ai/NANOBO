# NANOBO — Boutique de mode enfant

Boutique e-commerce inspirée de l'esthétique douce et colorée des thèmes
Shopify « kids store » (ex. Titoo) : hero animé, grille de catégories,
catalogue filtrable, fiche produit complète, panier et tunnel de commande
simulé — pilotée par une **interface d'administration** complète pour
gérer le catalogue (titres, prix, stock, variantes, description, SEO,
photos avec optimisation automatique).

> ⚠️ **Panier et paiement simulés.** Le panier est stocké dans le
> `localStorage` du navigateur et la commande n'effectue aucun paiement
> réel. En revanche, le **catalogue produit est bien réel** : il est géré
> depuis `/admin` et servi par une petite API (voir ci-dessous).

## Aperçu des pages

| Page | Fichier | Description |
|---|---|---|
| Accueil | `index.html` | Hero, catégories, best-sellers, promo, nouveautés, avis, newsletter |
| Boutique | `boutique.html` | Catalogue complet avec filtres (catégorie, taille, couleur, prix, soldes) et tri |
| Fiche produit | `produit.html?id=p01` | Galerie photo, sélection taille/couleur, quantité, avis, produits similaires |
| Panier | `panier.html` | Gestion des quantités, code promo (`NANOBO10`), récapitulatif |
| Commande | `commande.html` | Formulaire de livraison/paiement (simulé) + confirmation |
| À propos | `a-propos.html` | Histoire de la marque, valeurs, équipe |
| Contact | `contact.html` | Formulaire de contact (démo) + FAQ |
| **Administration** | `/admin` | Tableau de bord + gestion complète des produits |

## Interface d'administration (`/admin`)

Protégée par mot de passe, elle permet de gérer tout le catalogue affiché
sur la boutique :

- **Titre, description courte et détaillée**
- **URL / slug**, généré automatiquement (modifiable)
- **Prix**, prix barré (promo), badge (Nouveau / Promo / Best-seller)
- **Stock** et référence SKU
- **Variantes** : tailles et couleurs disponibles (saisie par tags)
- **Détails produit** : liste de caractéristiques (composition, entretien…)
- **Photos produit** : glisser-déposer, upload vers Cloudinary avec
  **optimisation automatique** (compression, format moderne, recadrage),
  image principale et miniatures, taille avant/après affichée
- **Référencement (SEO)** : meta titre / meta description avec compteurs
  de caractères et **aperçu Google** en direct
- **Statut** : brouillon ou publié (seuls les produits publiés
  apparaissent sur la boutique)

Le tableau de bord liste tous les produits avec recherche, filtres
(catégorie / statut), indicateurs (total, publiés, brouillons, ruptures
de stock) et actions rapides (modifier / supprimer).

La boutique publique (`index.html`, `boutique.html`, `produit.html`…)
charge le catalogue en direct depuis `GET /api/products` : toute
modification faite dans `/admin` apparaît immédiatement sur le site.

## Structure du projet

```
nanobo/
├── server.js                  # Serveur Express : API publique + API admin + pages admin
├── lib/
│   ├── productsStore.js       # CRUD produits (data/products.json)
│   ├── cloudinary.js          # Upload & optimisation des photos produit
│   ├── config.js              # Mot de passe admin + identifiants Cloudinary
│   └── adminAuth.js           # Sessions et middleware d'authentification admin
├── data/
│   └── products.json          # Catalogue produit (données de démonstration en seed)
├── public/                    # Fichiers servis tels quels
│   ├── index.html, boutique.html, produit.html, panier.html,
│   │   commande.html, a-propos.html, contact.html
│   ├── css/style.css           # Design system boutique (tokens, composants, responsive)
│   ├── js/
│   │   ├── icons.js             # Icônes SVG inline (UI + pictos produit de secours)
│   │   ├── products.js          # Chargement du catalogue depuis l'API + rendu des grilles
│   │   ├── cart.js              # Panier & liste de souhaits (localStorage)
│   │   └── main.js              # Interactions : menu mobile, accordéons, reveal au scroll…
│   └── admin/
│       ├── index.html            # Connexion + tableau de bord produits
│       ├── produit.html          # Formulaire de création/édition produit
│       ├── admin.css             # Design system de l'administration
│       └── admin.js              # Helpers admin (API, upload, tags, modales…)
├── render.yaml
└── package.json
```

Quand un produit n'a pas encore de photo, il est illustré par un
pictogramme SVG plat généré en code (`public/js/icons.js`) — pratique
pour démarrer un catalogue avant d'avoir les vraies photos.

## Installation & lancement en local

```bash
npm install
cp .env.example .env   # puis complète les variables (voir ci-dessous)
npm start               # ou npm run dev pour le rechargement automatique
```

Puis ouvre `http://localhost:3000` (boutique) et `http://localhost:3000/admin`
(administration).

### Variables d'environnement

| Variable | Rôle | Obligatoire |
|---|---|---|
| `ADMIN_PASSWORD` | Mot de passe de connexion à `/admin`. Si absente, un mot de passe est généré automatiquement au premier démarrage et affiché dans les logs. | Non (mais recommandé en production) |
| `CLOUDINARY_CLOUD_NAME` | Nom de ton compte Cloudinary. | Non — sans elle, l'upload de photos est désactivé (un pictogramme de secours est utilisé à la place) |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary. | Idem |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary. | Idem |
| `PORT` | Port d'écoute du serveur. | Non (3000 par défaut) |

Un compte [Cloudinary](https://cloudinary.com/) gratuit (25 Go) suffit
largement : crée un compte, récupère les 3 identifiants depuis le
Dashboard (« Product Environment Credentials ») et colle-les dans `.env`.

## Déploiement sur Render

Le dépôt contient un fichier `render.yaml` (Blueprint Render) prêt à l'emploi,
qui configure un **service Web Node** (le site n'est plus 100% statique :
l'administration a besoin d'un serveur).

1. Sur [render.com](https://render.com), clique sur **New +** → **Blueprint**.
2. Connecte ce dépôt GitHub (`laklachezouheir-ai/NANOBO`) et sélectionne la
   branche à déployer (`main`).
3. Render détecte `render.yaml` et propose de créer le service web `nanobo`
   (build : `npm install`, démarrage : `npm start`).
4. Renseigne les variables d'environnement demandées (`ADMIN_PASSWORD`,
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
5. Clique sur **Apply** / **Create Web Service**. Render build et démarre
   l'app, puis fournit une URL publique du type
   `https://nanobo-xxxx.onrender.com`.

**⚠️ Important — disque non persistant.** Comme pour tout service web
Render sur un plan sans disque persistant, le système de fichiers est
réinitialisé à chaque déploiement et à chaque redémarrage (y compris la
mise en veille automatique du plan gratuit après inactivité). Cela signifie
que **les produits ajoutés/modifiés depuis `/admin` seront perdus au
prochain redémarrage** tant que `data/` n'est pas sur un disque persistant.
Deux options :

- Pour une utilisation sérieuse : ajoute un [Render Disk](https://render.com/docs/disks)
  monté sur `./data` (nécessite un plan payant) — le catalogue édité
  survivra alors aux redéploiements.
- Pour tester/démontrer : c'est sans conséquence, le catalogue de
  démonstration (`data/products.json`, committé dans le dépôt) est
  toujours là au redémarrage.

Les **photos produit**, elles, sont toujours persistantes puisqu'elles
sont hébergées sur Cloudinary, pas sur le disque du serveur.

## Personnalisation rapide

- **Catalogue produit** : géré depuis `/admin` (recommandé), ou en éditant
  directement `data/products.json`.
- **Palette de couleurs** : variables CSS en tête de `public/css/style.css`
  (`--coral`, `--mint`, `--yellow`, `--sky`, `--violet`…) et de
  `public/admin/admin.css` pour l'administration.
- **Typographies** : « Baloo 2 » (titres) et « Poppins » (texte), chargées
  depuis Google Fonts dans le `<head>` de chaque page.
- **Textes de marque** : nom « NANOBO », adresse, téléphone et e-mail sont
  répétés dans le pied de page de chaque fichier HTML — remplacez-les par
  vos vraies coordonnées avant mise en production.

## Prochaines étapes possibles

- Ajouter un vrai paiement (Stripe Checkout) au tunnel de commande.
- Comptes clients, historique de commandes, avis vérifiés.
- Gestion des commandes côté admin (liste, statuts, export).
- Rôles admin multiples (actuellement : un seul mot de passe partagé).

# NANOBO — Boutique de mode enfant

Boutique e-commerce inspirée de l'esthétique douce et colorée des thèmes
Shopify « kids store » (ex. Titoo) : hero animé, grille de catégories,
catalogue filtrable, fiche produit complète, panier et tunnel de commande
simulé — pilotée par une **interface d'administration** complète pour
gérer le catalogue (titres, prix, stock, variantes, description, SEO,
photos avec optimisation automatique).

> ⚠️ **Paiement simulé.** Le panier est stocké dans le `localStorage` du
> navigateur et aucun paiement réel n'est effectué. En revanche, la
> **commande elle-même est bien réelle** : elle est enregistrée côté
> serveur, visible et gérable depuis `/admin/commandes`, et un e-mail de
> confirmation peut être envoyé automatiquement au client (voir
> ci-dessous). Le **catalogue produit est bien réel** aussi : il est géré
> depuis `/admin` et servi par une petite API (voir ci-dessous).

## Aperçu des pages

| Page | Fichier | Description |
|---|---|---|
| Accueil | `index.html` | Hero, catégories, best-sellers, promo, nouveautés, avis, newsletter |
| Boutique | `boutique.html` | Catalogue complet avec filtres (catégorie, taille, couleur, prix, soldes) et tri |
| Fiche produit | `produit.html?id=p01` | Galerie photo, sélection taille/couleur, quantité, avis, produits similaires |
| Panier | `panier.html` | Gestion des quantités, code promo (`NANOBO10`), récapitulatif |
| Commande | `commande.html` | Formulaire de livraison/paiement, création d'une vraie commande + confirmation |
| À propos | `a-propos.html` | Histoire de la marque, valeurs, équipe |
| Contact | `contact.html` | Formulaire de contact (démo) + FAQ |
| **Administration** | `/admin` | Tableau de bord + gestion complète des produits |
| **Commandes (admin)** | `/admin/commandes` | Liste des commandes, changement de statut, détail, renvoi d'e-mail |

## Interface d'administration (`/admin`)

Protégée par mot de passe, elle permet de gérer tout le catalogue affiché
sur la boutique :

- **Titre, description courte et détaillée**
- **URL / slug**, généré automatiquement (modifiable)
- **Prix**, prix barré (promo), badge (Nouveau / Promo / Best-seller)
- **Stock** et référence SKU
- **Variantes** : tailles et couleurs disponibles (saisie par tags)
- **Détails produit** : liste de caractéristiques (composition, entretien…)
- **Photos produit** : glisser-déposer, upload vers Cloudflare R2 avec
  **optimisation automatique côté serveur** (compression, conversion en
  WebP, redimensionnement), image principale et miniatures, taille
  avant/après affichée
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

### Gestion des commandes (`/admin/commandes`)

Chaque commande passée sur `commande.html` est enregistrée côté serveur
(les prix sont toujours recalculés à partir du catalogue réel, jamais
depuis ce qu'envoie le navigateur) et apparaît immédiatement dans
`/admin/commandes` :

- **Liste des commandes** avec recherche (n° commande, nom, e-mail),
  filtre par statut, et indicateurs (total, chiffre d'affaires, nouvelles,
  à expédier)
- **Changement de statut** directement depuis la liste ou la fiche détail
  (*Nouvelle*, *En préparation*, *Expédiée*, *Livrée*, *Annulée*)
- **Fiche détail** d'une commande : articles commandés, client, adresse
  de livraison, mode de paiement, et statut d'envoi de l'e-mail de
  confirmation
- **E-mail de confirmation automatique** envoyé au client via
  [Resend](https://resend.com/) dès qu'une commande est passée (si
  configuré — voir variables d'environnement ci-dessous), avec un bouton
  pour le renvoyer manuellement depuis la fiche détail

Sans `RESEND_API_KEY`, les commandes continuent de fonctionner
normalement : elles sont enregistrées et gérables depuis `/admin`, seul
l'envoi d'e-mail est désactivé (un bandeau d'avertissement l'indique dans
l'admin).

## Structure du projet

```
nanobo/
├── server.js                  # Serveur Express : API publique + API admin + pages admin
├── lib/
│   ├── productsStore.js       # CRUD produits (data/products.json)
│   ├── ordersStore.js         # CRUD commandes (data/orders.json)
│   ├── mailer.js               # Envoi de l'e-mail de confirmation de commande (Resend)
│   ├── r2.js                  # Upload, optimisation (sharp) & stockage des photos produit
│   ├── config.js              # Mot de passe admin + identifiants Cloudflare R2 + Resend
│   └── adminAuth.js           # Sessions et middleware d'authentification admin
├── data/
│   ├── products.json          # Catalogue produit (données de démonstration en seed)
│   └── orders.json            # Commandes enregistrées (généré à l'exécution, non versionné)
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
│       ├── commandes.html        # Liste des commandes
│       ├── commande.html         # Fiche détail d'une commande
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
| `R2_ACCOUNT_ID` | Identifiant de ton compte Cloudflare. | Non — sans ces 5 variables, l'upload de photos est désactivé (un pictogramme de secours est utilisé à la place) |
| `R2_ACCESS_KEY_ID` | Clé d'accès du jeton API R2. | Idem |
| `R2_SECRET_ACCESS_KEY` | Secret du jeton API R2. | Idem |
| `R2_BUCKET_NAME` | Nom du bucket R2 (ex. `nanobo`). | Idem |
| `R2_PUBLIC_URL` | URL publique du bucket (sous-domaine `r2.dev` ou domaine personnalisé). | Idem |
| `RESEND_API_KEY` | Clé API [Resend](https://resend.com/), pour l'envoi de l'e-mail de confirmation de commande. | Non — sans elle, les commandes sont enregistrées normalement mais aucun e-mail n'est envoyé |
| `RESEND_FROM_EMAIL` | Adresse d'expédition des e-mails (ex. `NANOBO <commandes@ton-domaine.com>`). | Non (utilise l'adresse de test `onboarding@resend.dev` par défaut) |
| `PORT` | Port d'écoute du serveur. | Non (3000 par défaut) |

Un compte [Cloudflare](https://dash.cloudflare.com/) gratuit suffit
(R2 offre 10 Go de stockage gratuits/mois, sans frais de sortie — une
carte bancaire est demandée pour activer R2 mais rien n'est facturé sous
le quota gratuit) :

1. **R2 Object Storage** → **Create bucket** (ex. `nanobo`).
2. Récupère l'**Account ID** affiché sur la page R2.
3. **Manage R2 API Tokens** → **Create API Token** (permissions *Object
   Read & Write*, scopé au bucket) → note l'**Access Key ID** et le
   **Secret Access Key** affichés (le secret n'est montré qu'une fois).
4. Dans les **Settings** du bucket → **Public Access** → active le
   sous-domaine `r2.dev` (ou connecte un domaine personnalisé) pour
   obtenir l'URL publique.

Contrairement à Cloudinary, R2 est du stockage pur (pas de
transformation à la volée) : l'optimisation (redimensionnement max
1600px, compression, conversion en WebP) est donc faite une fois, côté
serveur, avant l'upload (voir `lib/r2.js`, librairie `sharp`).

Pour activer l'e-mail de confirmation de commande, crée un compte
[Resend](https://resend.com/) gratuit (3000 e-mails/mois offerts, aucune
carte bancaire requise) :

1. Crée un compte sur [resend.com](https://resend.com/).
2. **API Keys** → **Create API Key** → copie la clé générée (elle n'est
   montrée qu'une fois) dans `RESEND_API_KEY`.
3. (Optionnel) Sans domaine vérifié, les e-mails partent depuis l'adresse
   de test `onboarding@resend.dev` — suffisant pour démarrer. Pour
   utiliser ta propre adresse (ex. `commandes@nanobo.com`), vérifie ton
   domaine dans **Domains** puis renseigne `RESEND_FROM_EMAIL`.

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
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
   `R2_BUCKET_NAME`, `R2_PUBLIC_URL`, et si souhaité `RESEND_API_KEY` /
   `RESEND_FROM_EMAIL` pour l'envoi des e-mails de confirmation).
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
sont hébergées sur Cloudflare R2, pas sur le disque du serveur.

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
- Export des commandes (CSV), filtres avancés, pagination.
- Rôles admin multiples (actuellement : un seul mot de passe partagé).

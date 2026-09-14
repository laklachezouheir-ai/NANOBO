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

### Import rapide de produits depuis Telegram

Pour accélérer l'ajout de produits repérés chez un fournisseur sur
Telegram : transfère une ou plusieurs photos du même produit (en album
si besoin) à ton bot Telegram personnel — il télécharge les photos, les
optimise et les envoie sur le même stockage que l'admin (Cloudflare R2),
puis crée un **produit en brouillon** dans NANOBO avec toutes les photos.
Plusieurs photos envoyées ensemble (même album) créent un seul produit,
pas un par photo.

Pour préremplir directement le nom, la catégorie, le prix et la
description, écris la légende de la photo (ou de la première photo de
l'album) sous ce format (chaque ligne est optionnelle) :

```
Nom: Robe rose à fleurs
Genre: Fille
Prix: 150
Prix barré: 220
Description: Robe légère pour l'été, taille 2-4 ans
```

- `Genre` est comparé aux catégories existantes dans `/admin` (par
  exemple "Fille" → catégorie *Filles*, "Garçon" → *Garçons*) — sans
  tenir compte des majuscules/accents. S'il n'est pas reconnu, le bot le
  signale et la catégorie reste à choisir manuellement.
- `Prix barré` affiche un prix barré (promo) au-dessus du prix normal.
- Le badge **Nouveau** est appliqué automatiquement à tous les produits
  importés depuis Telegram.

Si la légende ne suit pas ce format (ou qu'il n'y en a pas), un
brouillon est quand même créé, à compléter dans `/admin` : ouvre la
fiche, complète le prix, la catégorie et la description, puis publie.

Configuration (voir aussi les variables d'environnement plus bas) :

1. Sur Telegram, ouvre une conversation avec **@BotFather**, envoie
   `/newbot` et suis les instructions — il te donne un jeton
   (`TELEGRAM_BOT_TOKEN`).
2. Renseigne `TELEGRAM_BOT_TOKEN` dans les variables d'environnement du
   serveur, puis envoie n'importe quel message à ton bot sur Telegram :
   il te répond avec ton identifiant de chat.
3. Renseigne cet identifiant dans `TELEGRAM_ALLOWED_CHAT_ID` (ça
   verrouille le bot pour qu'il ne réponde qu'à toi).
4. Active le webhook en visitant une seule fois cette adresse dans un
   navigateur (remplace `<TOKEN>` par ton jeton et `<URL_DU_SITE>` par
   l'adresse de ton site) :
   `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL_DU_SITE>/api/telegram/webhook`

Sans `TELEGRAM_BOT_TOKEN`, cette fonctionnalité est simplement
désactivée — le reste du site n'est pas affecté.

### Assistant IA (DeepSeek)

Avec une clé [DeepSeek](https://platform.deepseek.com/) (`DEEPSEEK_API_KEY`),
trois fonctionnalités s'activent automatiquement :

- **Description produit auto-générée** — quand un produit importé depuis
  Telegram n'a pas de description, une courte description marketing est
  rédigée automatiquement à partir de son nom.
- **Détection de catégorie** — si le "Genre" n'est pas précisé (ou pas
  reconnu) dans la légende Telegram, la catégorie la plus probable est
  déduite du nom du produit, parmi les catégories réellement configurées
  dans `/admin/categories`.
- **Résumé des ventes** — un bouton "Générer un résumé" apparaît sur le
  tableau de bord (`/admin`), qui analyse les commandes et donne des
  observations en langage simple (ce qui se vend bien, ce qui stagne...).

DeepSeek utilise un modèle texte uniquement : il ne peut pas "regarder"
une photo, seulement s'appuyer sur le nom/texte fourni. Sans
`DEEPSEEK_API_KEY`, ces trois fonctionnalités sont simplement désactivées.

## Structure du projet

```
nanobo/
├── server.js                  # Serveur Express : API publique + API admin + pages admin
├── lib/
│   ├── productsStore.js       # CRUD produits (data/products.json)
│   ├── ordersStore.js         # CRUD commandes (data/orders.json)
│   ├── mailer.js               # Envoi de l'e-mail de confirmation de commande (Resend)
│   ├── telegram.js            # Import de produits en brouillon depuis un bot Telegram
│   ├── deepseek.js            # Appel générique à l'API DeepSeek (texte)
│   ├── insights.js            # Résumé des ventes pour l'admin (via DeepSeek)
│   ├── r2.js                  # Upload, optimisation (sharp) & stockage des photos produit
│   ├── persistence.js         # Rend permanentes les données via R2 (survit aux redéploiements)
│   ├── config.js              # Mot de passe admin + identifiants Cloudflare R2 + Resend + Telegram + DeepSeek
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
| `TELEGRAM_BOT_TOKEN` | Jeton du bot Telegram (obtenu via @BotFather), pour l'import rapide de produits. | Non — sans lui, cette fonctionnalité est simplement désactivée |
| `TELEGRAM_ALLOWED_CHAT_ID` | Identifiant de chat Telegram autorisé à créer des produits (le bot te le révèle à ton premier message). | Non, mais fortement recommandé une fois le bot configuré (sinon il ne crée aucun produit, par sécurité) |
| `DEEPSEEK_API_KEY` | Clé API [DeepSeek](https://platform.deepseek.com/), pour la description auto-générée, la détection de catégorie et le résumé des ventes. | Non — sans elle, ces fonctionnalités sont simplement désactivées |
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
   `RESEND_FROM_EMAIL` pour l'envoi des e-mails de confirmation,
   `TELEGRAM_BOT_TOKEN` / `TELEGRAM_ALLOWED_CHAT_ID` pour l'import de
   produits depuis Telegram, et `DEEPSEEK_API_KEY` pour la description
   auto-générée, la détection de catégorie et le résumé des ventes).
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

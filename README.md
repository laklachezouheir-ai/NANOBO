# NANOBO — Boutique de mode enfant

Vitrine e-commerce statique inspirée de l'esthétique douce et colorée des
thèmes Shopify « kids store » (ex. Titoo) : hero animé, grille de
catégories, catalogue filtrable, fiche produit complète, panier et tunnel
de commande simulé.

> ⚠️ **Démonstration front-end uniquement.** Il n'y a ni base de données,
> ni paiement réel, ni envoi d'e-mail : le panier est stocké dans le
> `localStorage` du navigateur et la commande est simulée. C'est une base
> prête à être branchée sur un vrai backend (Shopify, Stripe, un CMS
> headless…) selon vos besoins.

## Aperçu des pages

| Page | Fichier | Description |
|---|---|---|
| Accueil | `index.html` | Hero, catégories, best-sellers, promo, nouveautés, avis, newsletter |
| Boutique | `boutique.html` | Catalogue complet avec filtres (catégorie, taille, couleur, prix, soldes) et tri |
| Fiche produit | `produit.html?id=p01` | Galerie, sélection taille/couleur, quantité, avis, produits similaires |
| Panier | `panier.html` | Gestion des quantités, code promo (`NANOBO10`), récapitulatif |
| Commande | `commande.html` | Formulaire de livraison/paiement (simulé) + confirmation |
| À propos | `a-propos.html` | Histoire de la marque, valeurs, équipe |
| Contact | `contact.html` | Formulaire de contact (démo) + FAQ |

## Structure du projet

```
nanobo/
├── index.html
├── boutique.html
├── produit.html
├── panier.html
├── commande.html
├── a-propos.html
├── contact.html
├── css/
│   └── style.css        # Design system complet (tokens, composants, responsive)
├── js/
│   ├── icons.js          # Icônes SVG inline (UI + pictos produit), zéro dépendance externe
│   ├── products.js        # Catalogue produit de démonstration + rendu des grilles
│   ├── cart.js            # Panier & liste de souhaits (localStorage)
│   └── main.js             # Interactions : menu mobile, accordéons, reveal au scroll…
└── README.md
```

Aucune image externe n'est utilisée : chaque produit est illustré par un
pictogramme SVG plat généré en code (`js/icons.js`), ce qui rend le site
100% autonome, rapide et facile à personnaliser (remplacez simplement les
pictos par de vraies photos produit quand elles seront disponibles).

## Lancer le site en local

Aucune dépendance ni build : ce sont des fichiers HTML/CSS/JS statiques.

```bash
# Avec Python
python3 -m http.server 8080

# ou avec Node (npx)
npx serve .
```

Puis ouvrez `http://localhost:8080`.

## Déploiement

Le site est 100% statique : il peut être déployé tel quel sur GitHub
Pages, Netlify, Vercel, Render (site statique) ou tout hébergeur
proposant des fichiers HTML.

### Déploiement sur Render

Le dépôt contient un fichier `render.yaml` (Blueprint Render) prêt à l'emploi,
qui configure un **site statique** (aucun serveur, aucun build requis).

1. Sur [render.com](https://render.com), clique sur **New +** → **Blueprint**.
2. Connecte ce dépôt GitHub (`laklachezouheir-ai/NANOBO`) et sélectionne la
   branche à déployer (`main`).
3. Render détecte `render.yaml` et propose de créer le service statique
   `nanobo` (build : aucun, dossier publié : la racine du dépôt).
4. Clique sur **Apply** / **Create Static Site**. Render déploie le site et
   fournit une URL publique du type `https://nanobo-xxxx.onrender.com`.

Si tu préfères créer le service manuellement (sans Blueprint) : **New +** →
**Static Site**, connecte le dépôt, laisse *Build Command* vide et renseigne
`.` comme *Publish Directory*.

## Personnalisation rapide

- **Catalogue produit** : éditez le tableau `PRODUCTS` dans `js/products.js`
  (nom, prix, catégorie, tailles, couleurs, icône, description…).
- **Palette de couleurs** : variables CSS en tête de `css/style.css`
  (`--coral`, `--mint`, `--yellow`, `--sky`, `--violet`…).
- **Typographies** : « Baloo 2 » (titres) et « Poppins » (texte), chargées
  depuis Google Fonts dans le `<head>` de chaque page.
- **Textes de marque** : nom « NANOBO », adresse, téléphone et e-mail sont
  répétés dans le pied de page de chaque fichier HTML — remplacez-les par
  vos vraies coordonnées avant mise en production.

## Prochaines étapes possibles

- Brancher un vrai backend e-commerce (Shopify, Medusa, Stripe Checkout…)
  pour un paiement réel et une gestion de stock.
- Remplacer les pictogrammes par de vraies photos produit.
- Ajouter un compte client, un historique de commandes et des avis
  vérifiés.

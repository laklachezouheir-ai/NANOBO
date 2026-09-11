/* =========================================================
   NANOBO — Catalogue produits (données de démonstration)
   ========================================================= */

/* Palettes de couleurs utilisées pour les vignettes produit */
const PALETTE = {
  corail: { bg: "#ffe1e6", icon: "#ff6b7a" },
  menthe: { bg: "#d9f7f2", icon: "#2ec4b6" },
  jaune: { bg: "#fff3d6", icon: "#f2b705" },
  ciel: { bg: "#e2f1fb", icon: "#4ea8de" },
  violet: { bg: "#efe9fe", icon: "#a78bfa" },
  peche: { bg: "#ffe8d6", icon: "#ff9466" },
};

const COLOR_SWATCHES = {
  Corail: "#ff6b7a",
  Menthe: "#2ec4b6",
  Jaune: "#ffd166",
  Ciel: "#4ea8de",
  Violet: "#a78bfa",
  Blanc: "#ffffff",
  Marine: "#2b2b3d",
  Rose: "#ffb3c1",
};

const PRODUCTS = [
  {
    id: "p01",
    name: "Robe Arc-en-ciel Volantée",
    category: "filles",
    ageGroup: "4-8 ans",
    price: 34.9,
    oldPrice: 44.9,
    badge: "promo",
    rating: 4.8,
    reviews: 32,
    colors: ["Corail", "Jaune"],
    sizes: ["2-3a", "4-5a", "6-7a", "8-9a"],
    icon: "dress",
    palette: "corail",
    desc: "Une robe légère et virevoltante en coton doux, parfaite pour danser toute la journée. Volants colorés et finitions soignées.",
    details: ["100% coton biologique", "Lavage machine 30°C", "Fermeture zip dos", "Fabriquée avec des teintures certifiées OEKO-TEX"],
    tags: ["nouveaute"],
  },
  {
    id: "p02",
    name: "T-shirt Dino Souriant",
    category: "garcons",
    ageGroup: "2-8 ans",
    price: 16.9,
    badge: "bestseller",
    rating: 4.9,
    reviews: 58,
    colors: ["Menthe", "Ciel"],
    sizes: ["2-3a", "4-5a", "6-7a", "8-9a", "10-11a"],
    icon: "tshirt",
    palette: "menthe",
    desc: "T-shirt en jersey ultra-doux avec impression dinosaure rigolote. Coupe confortable pour un maximum de liberté de mouvement.",
    details: ["100% coton peigné", "Col rond renforcé", "Impression résistante au lavage"],
    tags: ["bestseller"],
  },
  {
    id: "p03",
    name: "Hoodie Nuage Cosy",
    category: "garcons",
    ageGroup: "4-10 ans",
    price: 29.9,
    badge: "new",
    rating: 4.7,
    reviews: 21,
    colors: ["Ciel", "Marine"],
    sizes: ["4-5a", "6-7a", "8-9a", "10-11a"],
    icon: "hoodie",
    palette: "ciel",
    desc: "Sweat à capuche molletonné, doublure douillette et poche kangourou. L'indispensable pour les journées fraîches.",
    details: ["80% coton, 20% polyester", "Capuche doublée", "Poche kangourou"],
    tags: ["nouveaute"],
  },
  {
    id: "p04",
    name: "Short Rayé Été",
    category: "garcons",
    ageGroup: "2-8 ans",
    price: 14.9,
    rating: 4.5,
    reviews: 14,
    colors: ["Jaune", "Corail"],
    sizes: ["2-3a", "4-5a", "6-7a"],
    icon: "shorts",
    palette: "jaune",
    desc: "Short léger à rayures, taille élastiquée pour un confort optimal en toute saison.",
    details: ["100% coton", "Taille élastique ajustable", "Poches latérales"],
    tags: [],
  },
  {
    id: "p05",
    name: "Combishort Bébé Étoiles",
    category: "bebe",
    ageGroup: "0-24 mois",
    price: 19.9,
    badge: "bestseller",
    rating: 4.9,
    reviews: 47,
    colors: ["Ciel", "Jaune"],
    sizes: ["0-3m", "3-6m", "6-12m", "12-24m"],
    icon: "romper",
    palette: "peche",
    desc: "Combishort tout doux avec pressions faciles pour un change express. Motif étoiles brodé.",
    details: ["100% coton bio", "Pressions pratiques entrejambe", "Certifié OEKO-TEX"],
    tags: ["bestseller"],
  },
  {
    id: "p06",
    name: "Pyjama Étoiles Filantes",
    category: "bebe",
    ageGroup: "0-24 mois",
    price: 22.9,
    oldPrice: 27.9,
    badge: "promo",
    rating: 4.6,
    reviews: 19,
    colors: ["Violet", "Ciel"],
    sizes: ["0-3m", "3-6m", "6-12m"],
    icon: "pajama",
    palette: "violet",
    desc: "Pyjama une pièce ultra confortable pour des nuits douces. Coutures plates anti-irritation.",
    details: ["Coton bio brossé", "Coutures plates", "Fermeture zip sans coince-peau"],
    tags: ["promo"],
  },
  {
    id: "p07",
    name: "Jupe Plissée Pastel",
    category: "filles",
    ageGroup: "4-10 ans",
    price: 24.9,
    badge: "new",
    rating: 4.7,
    reviews: 12,
    colors: ["Rose", "Menthe"],
    sizes: ["4-5a", "6-7a", "8-9a", "10-11a"],
    icon: "skirt",
    palette: "corail",
    desc: "Jupe plissée virevoltante, taille élastique confortable. Idéale à assortir avec nos tops de la collection.",
    details: ["Polyester recyclé", "Doublure intégrée", "Taille élastique"],
    tags: ["nouveaute"],
  },
  {
    id: "p08",
    name: "Polo Rayures Marine",
    category: "garcons",
    ageGroup: "4-10 ans",
    price: 18.9,
    rating: 4.4,
    reviews: 9,
    colors: ["Marine", "Blanc"],
    sizes: ["4-5a", "6-7a", "8-9a"],
    icon: "poloshirt",
    palette: "ciel",
    desc: "Polo piqué classique et intemporel, parfait pour un look chic-décontracté.",
    details: ["100% coton piqué", "Boutons nacrés", "Col côtelé"],
    tags: [],
  },
  {
    id: "p09",
    name: "Jean Doudou Slim",
    category: "garcons",
    ageGroup: "2-10 ans",
    price: 32.9,
    rating: 4.6,
    reviews: 26,
    colors: ["Marine"],
    sizes: ["2-3a", "4-5a", "6-7a", "8-9a", "10-11a"],
    icon: "jeans",
    palette: "jaune",
    desc: "Jean stretch confort avec taille ajustable, coupe slim et résistance à toute épreuve pour les journées bien remplies.",
    details: ["98% coton, 2% élasthanne", "Taille ajustable bouton intérieur", "Poches fonctionnelles"],
    tags: ["bestseller"],
  },
  {
    id: "p10",
    name: "Maillot de Bain Corail",
    category: "filles",
    ageGroup: "2-10 ans",
    price: 21.9,
    badge: "new",
    rating: 4.8,
    reviews: 15,
    colors: ["Corail", "Jaune"],
    sizes: ["2-3a", "4-5a", "6-7a", "8-9a"],
    icon: "swimsuit",
    palette: "corail",
    desc: "Maillot une pièce anti-UV (UPF 50+) pour des journées à la plage en toute sérénité.",
    details: ["Protection UPF 50+", "Sèche rapidement", "Résistant au chlore"],
    tags: ["nouveaute"],
  },
  {
    id: "p11",
    name: "Sneakers Étoile Blanche",
    category: "chaussures",
    ageGroup: "3-10 ans",
    price: 39.9,
    oldPrice: 49.9,
    badge: "promo",
    rating: 4.9,
    reviews: 63,
    colors: ["Blanc", "Corail"],
    sizes: ["24", "26", "28", "30", "32", "34"],
    icon: "sneaker",
    palette: "menthe",
    desc: "Baskets légères à scratch auto-agrippant, semelle souple qui accompagne chaque pas.",
    details: ["Tige textile respirante", "Semelle antidérapante", "Fermeture scratch facile"],
    tags: ["promo", "bestseller"],
  },
  {
    id: "p12",
    name: "Sandales Été Douces",
    category: "chaussures",
    ageGroup: "2-8 ans",
    price: 26.9,
    rating: 4.5,
    reviews: 18,
    colors: ["Rose", "Ciel"],
    sizes: ["22", "24", "26", "28", "30"],
    icon: "sandal",
    palette: "peche",
    desc: "Sandales confortables à double bride réglable, parfaites pour l'été.",
    details: ["Semelle amortissante", "Brides ajustables", "Matière lavable"],
    tags: [],
  },
  {
    id: "p13",
    name: "Casquette Aventure",
    category: "accessoires",
    ageGroup: "3-12 ans",
    price: 12.9,
    rating: 4.6,
    reviews: 22,
    colors: ["Menthe", "Jaune"],
    sizes: ["Unique"],
    icon: "cap",
    palette: "jaune",
    desc: "Casquette ajustable en toile respirante, indispensable pour les journées ensoleillées.",
    details: ["Toile coton respirante", "Sangle ajustable", "Protection solaire"],
    tags: ["nouveaute"],
  },
  {
    id: "p14",
    name: "Bonnet Pompon Douceur",
    category: "accessoires",
    ageGroup: "0-6 ans",
    price: 11.9,
    badge: "bestseller",
    rating: 4.8,
    reviews: 29,
    colors: ["Violet", "Rose"],
    sizes: ["Unique"],
    icon: "beanie",
    palette: "violet",
    desc: "Bonnet tricoté extra doux avec pompon, pour affronter l'hiver avec style.",
    details: ["Tricot acrylique doux", "Doublure polaire", "Pompon amovible"],
    tags: ["bestseller"],
  },
  {
    id: "p15",
    name: "Sac à Dos Copain Renard",
    category: "accessoires",
    ageGroup: "3-10 ans",
    price: 27.9,
    badge: "new",
    rating: 4.9,
    reviews: 41,
    colors: ["Corail", "Marine"],
    sizes: ["Unique"],
    icon: "backpack",
    palette: "corail",
    desc: "Sac à dos ludique au look renard malicieux, compartiment principal spacieux et bretelles rembourrées.",
    details: ["Toile résistante déperlante", "Bretelles rembourrées ajustables", "Poche avant zippée"],
    tags: ["nouveaute"],
  },
  {
    id: "p16",
    name: "Noeud Cheveux Duo",
    category: "accessoires",
    ageGroup: "1-10 ans",
    price: 8.9,
    rating: 4.7,
    reviews: 11,
    colors: ["Rose", "Menthe"],
    sizes: ["Unique"],
    icon: "bow",
    palette: "peche",
    desc: "Duo de noeuds pour cheveux en tissu doux, pour twister toutes les coiffures.",
    details: ["Barrette clic-clac", "Tissu doux non abrasif", "Lot de 2"],
    tags: [],
  },
  {
    id: "p17",
    name: "Chaussettes Motifs Fruits",
    category: "accessoires",
    ageGroup: "1-10 ans",
    price: 9.9,
    rating: 4.6,
    reviews: 16,
    colors: ["Jaune", "Corail"],
    sizes: ["Unique"],
    icon: "socks",
    palette: "jaune",
    desc: "Lot de 3 paires de chaussettes en coton doux, motifs fruits gourmands.",
    details: ["Coton peigné respirant", "Lot de 3 paires", "Bord côtelé anti-glisse"],
    tags: [],
  },
  {
    id: "p18",
    name: "Veste Doudoune Légère",
    category: "garcons",
    ageGroup: "4-10 ans",
    price: 44.9,
    oldPrice: 54.9,
    badge: "promo",
    rating: 4.7,
    reviews: 24,
    colors: ["Ciel", "Marine"],
    sizes: ["4-5a", "6-7a", "8-9a", "10-11a"],
    icon: "jacket",
    palette: "ciel",
    desc: "Doudoune légère et chaude, déperlante, capuche amovible pour toutes les sorties.",
    details: ["Rembourrage thermique léger", "Déperlant", "Capuche amovible"],
    tags: ["promo"],
  },
  {
    id: "p19",
    name: "Bavoir Petit Gourmand",
    category: "bebe",
    ageGroup: "0-18 mois",
    price: 7.9,
    rating: 4.5,
    reviews: 8,
    colors: ["Menthe", "Jaune"],
    sizes: ["Unique"],
    icon: "bib",
    palette: "menthe",
    desc: "Bavoir imperméable à poche récupératrice, pratique pour les repas sans souci.",
    details: ["Face imperméable PEVA", "Poche récupératrice", "Fermeture pression"],
    tags: [],
  },
  {
    id: "p20",
    name: "Robe Fleurie Printemps",
    category: "filles",
    ageGroup: "2-8 ans",
    price: 29.9,
    badge: "bestseller",
    rating: 4.8,
    reviews: 37,
    colors: ["Corail", "Menthe"],
    sizes: ["2-3a", "4-5a", "6-7a", "8-9a"],
    icon: "dress",
    palette: "menthe",
    desc: "Robe légère en voile fleuri, doublure douce, parfaite pour le printemps et l'été.",
    details: ["Voile de coton fleuri", "Doublure intérieure coton", "Fermeture boutons dos"],
    tags: ["bestseller"],
  },
];

const CATEGORY_LABELS = {
  filles: "Filles",
  garcons: "Garçons",
  bebe: "Bébé",
  accessoires: "Accessoires",
  chaussures: "Chaussures",
};

/* ---------- Helpers ---------- */

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function formatPrice(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function badgeMarkup(badge) {
  if (badge === "new") return '<span class="badge badge-new">Nouveau</span>';
  if (badge === "promo") return '<span class="badge badge-promo">Promo</span>';
  if (badge === "bestseller") return '<span class="badge badge-bestseller">Best-seller</span>';
  return "";
}

/* Rend une carte produit (grille boutique / accueil) */
function renderProductCard(pr) {
  const pal = PALETTE[pr.palette] || PALETTE.corail;
  const oldPriceHtml = pr.oldPrice ? `<span class="price-old">${formatPrice(pr.oldPrice)}</span>` : "";
  return `
  <article class="product-card reveal">
    <a href="produit.html?id=${pr.id}" class="product-media" style="background:${pal.bg}">
      ${pr.badge ? `<div class="product-badges">${badgeMarkup(pr.badge)}</div>` : ""}
      <button class="wishlist-btn" data-wishlist="${pr.id}" aria-label="Ajouter aux favoris" onclick="event.preventDefault(); toggleWishlist('${pr.id}', this)">${uiIcon("heart")}</button>
      ${productIcon(pr.icon, pal.icon, "#ffffff")}
    </a>
    <div class="product-info">
      <span class="product-category">${CATEGORY_LABELS[pr.category] || ""} · ${pr.ageGroup}</span>
      <a href="produit.html?id=${pr.id}" class="product-title">${pr.name}</a>
      <div class="product-rating">${starRow(pr.rating)} <span>(${pr.reviews})</span></div>
      <div class="product-price"><span class="price-now">${formatPrice(pr.price)}</span>${oldPriceHtml}</div>
    </div>
    <button class="quick-add" onclick="quickAddToCart('${pr.id}')">${uiIcon("cart")} Ajouter au panier</button>
  </article>`;
}

function renderProductGrid(list, targetSelector) {
  const el = document.querySelector(targetSelector);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <h3>Aucun produit trouvé</h3>
      <p>Essayez d'ajuster vos filtres pour voir plus de résultats.</p>
    </div>`;
    return;
  }
  el.innerHTML = list.map(renderProductCard).join("");
  initReveal();
}

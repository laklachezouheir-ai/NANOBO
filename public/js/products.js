/* =========================================================
   NANOBO — Catalogue produits (chargé depuis l'API /api/products,
   géré via l'interface d'administration /admin)
   ========================================================= */

/* Palettes de couleurs utilisées pour les vignettes produit de secours
   (quand un produit n'a pas encore de vraie photo). */
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

/* Catégories, chargées depuis /api/categories (gérées via /admin/categories).
   CATEGORY_LABELS reste un simple dictionnaire id -> nom affiché, reconstruit
   à chaque chargement pour rester compatible avec le code existant. */
let CATEGORIES = [];
let CATEGORY_LABELS = {};

async function loadCategories() {
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Réponse API invalide (" + res.status + ")");
    const data = await res.json();
    CATEGORIES = Array.isArray(data.categories) ? data.categories : [];
  } catch (err) {
    console.error("Impossible de charger les catégories :", err);
    CATEGORIES = [];
  }
  CATEGORY_LABELS = {};
  CATEGORIES.forEach((c) => (CATEGORY_LABELS[c.id] = c.label));
  return CATEGORIES;
}

/* Catalogue produit courant, peuplé par loadProducts(). Vide tant que
   l'appel API n'a pas abouti : chaque page doit `await loadProducts()`
   avant de faire appel aux fonctions de rendu ci-dessous. */
let PRODUCTS = [];
let PRODUCTS_LOADED = false;

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Réponse API invalide (" + res.status + ")");
    const data = await res.json();
    PRODUCTS = Array.isArray(data.products) ? data.products : [];
  } catch (err) {
    console.error("Impossible de charger le catalogue produit :", err);
    PRODUCTS = [];
  }
  PRODUCTS_LOADED = true;
  return PRODUCTS;
}

/* ---------- Helpers ---------- */

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function formatPrice(n) {
  return Number(n || 0).toFixed(2).replace(".", ",") + " €";
}

function badgeMarkup(badge) {
  if (badge === "new") return '<span class="badge badge-new">Nouveau</span>';
  if (badge === "promo") return '<span class="badge badge-promo">Promo</span>';
  if (badge === "bestseller") return '<span class="badge badge-bestseller">Best-seller</span>';
  return "";
}

/* Couleur de fond utilisée derrière une vignette produit (neutre si photo
   réelle disponible, sinon couleur de la palette de secours). */
function productBg(pr) {
  if (pr.images && pr.images.length) return "#f2efe9";
  const pal = PALETTE[pr.palette] || PALETTE.corail;
  return pal.bg;
}

/* Contenu visuel d'une vignette produit : vraie photo si disponible,
   sinon pictogramme SVG généré (voir js/icons.js). */
function productThumbHTML(pr) {
  if (pr.images && pr.images.length) {
    const img = pr.images[0];
    return `<img src="${img.url}" alt="${escapeAttr(pr.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`;
  }
  const pal = PALETTE[pr.palette] || PALETTE.corail;
  return productIcon(pr.icon, pal.icon, "#ffffff");
}

function escapeAttr(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* Rend une carte produit (grille boutique / accueil) */
function renderProductCard(pr) {
  const oldPriceHtml = pr.oldPrice ? `<span class="price-old">${formatPrice(pr.oldPrice)}</span>` : "";
  return `
  <article class="product-card reveal">
    <a href="produit.html?id=${pr.id}" class="product-media" style="background:${productBg(pr)}">
      ${pr.badge ? `<div class="product-badges">${badgeMarkup(pr.badge)}</div>` : ""}
      <button class="wishlist-btn" data-wishlist="${pr.id}" aria-label="Ajouter aux favoris" onclick="event.preventDefault(); toggleWishlist('${pr.id}', this)">${uiIcon("heart")}</button>
      ${productThumbHTML(pr)}
    </a>
    <div class="product-info">
      <span class="product-category">${CATEGORY_LABELS[pr.category] || ""} · ${pr.ageGroup || ""}</span>
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

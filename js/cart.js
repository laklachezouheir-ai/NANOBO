/* =========================================================
   NANOBO — Gestion du panier (localStorage, front-end only)
   ========================================================= */

const CART_KEY = "nanobo_cart";
const WISHLIST_KEY = "nanobo_wishlist";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    /* stockage indisponible (mode privé, etc.) : on ignore silencieusement */
  }
  updateCartCount();
}

function cartLineKey(id, size, color) {
  return `${id}__${size || "u"}__${color || "u"}`;
}

function addToCart(id, size, color, qty) {
  qty = qty || 1;
  const cart = getCart();
  const key = cartLineKey(id, size, color);
  const existing = cart.find((l) => cartLineKey(l.id, l.size, l.color) === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, size: size || null, color: color || null, qty });
  }
  saveCart(cart);
}

function updateCartLineQty(id, size, color, qty) {
  let cart = getCart();
  const key = cartLineKey(id, size, color);
  if (qty <= 0) {
    cart = cart.filter((l) => cartLineKey(l.id, l.size, l.color) !== key);
  } else {
    const line = cart.find((l) => cartLineKey(l.id, l.size, l.color) === key);
    if (line) line.qty = qty;
  }
  saveCart(cart);
}

function removeCartLine(id, size, color) {
  updateCartLineQty(id, size, color, 0);
}

function getCartCount() {
  return getCart().reduce((sum, l) => sum + l.qty, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, l) => {
    const pr = typeof getProductById === "function" ? getProductById(l.id) : null;
    return pr ? sum + pr.price * l.qty : sum;
  }, 0);
}

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = getCartCount();
  });
}

/* Ajout rapide depuis une carte produit (grille) avec petit feedback */
function quickAddToCart(id) {
  const pr = typeof getProductById === "function" ? getProductById(id) : null;
  const size = pr && pr.sizes && pr.sizes.length ? pr.sizes[0] : null;
  const color = pr && pr.colors && pr.colors.length ? pr.colors[0] : null;
  addToCart(id, size, color, 1);
  if (pr) showToast(pr);
}

/* ---------- Wishlist (favoris) ---------- */
function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveWishlist(list) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  } catch (e) {
    /* ignore */
  }
}

function toggleWishlist(id, btnEl) {
  let list = getWishlist();
  const idx = list.indexOf(id);
  if (idx > -1) {
    list.splice(idx, 1);
    if (btnEl) {
      btnEl.classList.remove("active");
      btnEl.innerHTML = uiIcon("heart");
    }
  } else {
    list.push(id);
    if (btnEl) {
      btnEl.classList.add("active");
      btnEl.innerHTML = uiIcon("heartFill");
    }
  }
  saveWishlist(list);
}

function isWishlisted(id) {
  return getWishlist().indexOf(id) > -1;
}

/* ---------- Toast "ajouté au panier" ---------- */
function showToast(product) {
  let toast = document.getElementById("cart-toast");
  if (!toast) return;
  const pal = PALETTE[product.palette] || PALETTE.corail;
  toast.innerHTML = `
    <span class="toast-icon">${uiIcon("checkCircle")}</span>
    <div class="thumb" style="background:${pal.bg}">${productIcon(product.icon, pal.icon, "#fff")}</div>
    <div>
      <strong>Ajouté au panier</strong>
      <span>${product.name}</span>
    </div>`;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

document.addEventListener("DOMContentLoaded", updateCartCount);

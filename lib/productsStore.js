const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { makePersistent } = require('./persistence');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

const BADGES = ['', 'new', 'promo', 'bestseller'];
const STATUSES = ['published', 'draft'];

function readAll() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2) + '\n', 'utf8');
}

const { init, persist } = makePersistent({ r2Key: 'data/products.json', readLocal: readAll, writeLocal: writeAll });

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function uniqueSlug(base, list, excludeId) {
  let slug = slugify(base) || 'produit';
  let i = 2;
  const taken = new Set(list.filter((p) => p.id !== excludeId).map((p) => p.slug));
  let candidate = slug;
  while (taken.has(candidate)) {
    candidate = `${slug}-${i}`;
    i += 1;
  }
  return candidate;
}

function generateId() {
  return 'p' + crypto.randomBytes(5).toString('hex');
}

function getAll() {
  return readAll().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

function getPublished() {
  return readAll().filter((p) => p.status === 'published');
}

function getById(id) {
  return readAll().find((p) => p.id === id) || null;
}

function getBySlug(slug) {
  return readAll().find((p) => p.slug === slug) || null;
}

/** Champs texte considérés côté serveur ; tout le reste est ignoré/écrasé. */
function sanitize(input, list, existing, fallbackId) {
  const name = String(input.name || '').trim();
  if (!name) {
    const err = new Error('Le titre du produit est obligatoire.');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  // Les catégories sont désormais gérées dynamiquement (lib/categoriesStore.js) :
  // on se contente ici de nettoyer la valeur, sans la valider contre une liste figée.
  const category = String(input.category || (existing ? existing.category : '')).trim();
  const badge = BADGES.includes(input.badge) ? input.badge : '';
  const status = STATUSES.includes(input.status) ? input.status : 'draft';

  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) {
    const err = new Error('Le prix doit être un nombre positif.');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const oldPriceRaw = input.oldPrice === '' || input.oldPrice == null ? null : Number(input.oldPrice);
  const oldPrice = Number.isFinite(oldPriceRaw) && oldPriceRaw > 0 ? oldPriceRaw : null;

  const stock = Number.isFinite(Number(input.stock)) ? Math.max(0, Math.round(Number(input.stock))) : 0;

  const toStringArray = (v) =>
    Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];

  const slugSource = input.slug && String(input.slug).trim() ? input.slug : name;
  const slug = uniqueSlug(slugSource, list, existing ? existing.id : undefined);

  return {
    name,
    slug,
    status,
    category,
    ageGroup: String(input.ageGroup || '').trim(),
    badge,
    price,
    oldPrice,
    sku: String(input.sku || (existing ? existing.sku : '')).trim() || `NANOBO-${((existing && existing.id) || fallbackId || 'NEW').toUpperCase()}`,
    stock,
    sizes: toStringArray(input.sizes),
    colors: toStringArray(input.colors),
    shortDescription: String(input.shortDescription || '').trim(),
    description: String(input.description || '').trim(),
    details: toStringArray(input.details),
    images: Array.isArray(input.images) ? input.images : existing ? existing.images : [],
    icon: String(input.icon || (existing ? existing.icon : 'tshirt')).trim(),
    palette: String(input.palette || (existing ? existing.palette : 'corail')).trim(),
    seo: {
      metaTitle: String(input.seo?.metaTitle || '').trim(),
      metaDescription: String(input.seo?.metaDescription || '').trim(),
    },
    rating: Number.isFinite(Number(input.rating)) ? Number(input.rating) : existing ? existing.rating : 5,
    reviews: Number.isFinite(Number(input.reviews)) ? Number(input.reviews) : existing ? existing.reviews : 0,
    tags: toStringArray(input.tags),
  };
}

async function create(input) {
  const list = readAll();
  const id = generateId();
  const clean = sanitize(input, list, null, id);
  const now = new Date().toISOString();
  const product = { id, ...clean, createdAt: now, updatedAt: now };
  list.push(product);
  writeAll(list);
  await persist(list);
  return product;
}

async function update(id, input) {
  const list = readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const clean = sanitize(input, list, list[idx]);
  const updated = { ...list[idx], ...clean, id, updatedAt: new Date().toISOString() };
  list[idx] = updated;
  writeAll(list);
  await persist(list);
  return updated;
}

async function remove(id) {
  const list = readAll();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  writeAll(next);
  await persist(next);
  return true;
}

module.exports = {
  BADGES,
  STATUSES,
  getAll,
  getPublished,
  getById,
  getBySlug,
  create,
  update,
  remove,
  slugify,
  init,
};

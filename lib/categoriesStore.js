const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

function readAll() {
  try {
    const raw = fs.readFileSync(CATEGORIES_FILE, 'utf8');
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(list, null, 2) + '\n', 'utf8');
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function uniqueId(base, list, excludeId) {
  const slug = slugify(base) || 'categorie';
  const taken = new Set(list.filter((c) => c.id !== excludeId).map((c) => c.id));
  let candidate = slug;
  let i = 2;
  while (taken.has(candidate)) {
    candidate = `${slug}-${i}`;
    i += 1;
  }
  return candidate;
}

function getAllSorted() {
  return readAll().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function getVisible() {
  return getAllSorted().filter((c) => c.visible !== false);
}

function getById(id) {
  return readAll().find((c) => c.id === id) || null;
}

function sanitize(input, list, existing) {
  const label = String(input.label || '').trim();
  if (!label) {
    const err = new Error('Le nom de la catégorie est obligatoire.');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  // L'id (utilisé dans les URL et pour rattacher les produits) reste stable
  // une fois créé : on ne le régénère que lors de la création.
  const id = existing ? existing.id : uniqueId(input.id || label, list, null);

  const order = Number.isFinite(Number(input.order)) ? Number(input.order) : existing ? existing.order : list.length + 1;

  return {
    id,
    label,
    tagline: String(input.tagline || '').trim(),
    icon: String(input.icon || (existing ? existing.icon : 'tshirt')).trim(),
    palette: String(input.palette || (existing ? existing.palette : 'corail')).trim(),
    image: input.image !== undefined ? input.image : existing ? existing.image ?? null : null, // {url, key} — sinon le pictogramme est utilisé
    order,
    visible: input.visible !== false,
  };
}

function create(input) {
  const list = readAll();
  const clean = sanitize(input, list, null);
  const now = new Date().toISOString();
  const category = { ...clean, createdAt: now, updatedAt: now };
  list.push(category);
  writeAll(list);
  return category;
}

function update(id, input) {
  const list = readAll();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const clean = sanitize(input, list, list[idx]);
  const updated = { ...list[idx], ...clean, id, updatedAt: new Date().toISOString() };
  list[idx] = updated;
  writeAll(list);
  return updated;
}

function remove(id) {
  const list = readAll();
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return false;
  writeAll(next);
  return true;
}

module.exports = { getAllSorted, getVisible, getById, create, update, remove, slugify };

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

const STATUSES = ['nouvelle', 'en_preparation', 'expediee', 'livree', 'annulee'];
const STATUS_LABELS = {
  nouvelle: 'Nouvelle',
  en_preparation: 'En préparation',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};

function readAll() {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2) + '\n', 'utf8');
}

function getAll() {
  return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getById(id) {
  return readAll().find((o) => o.id === id) || null;
}

function generateOrderNumber() {
  return 'NB-' + Math.floor(100000 + Math.random() * 899999);
}

function create({ customer, shipping, payment, items, subtotal, shippingCost, discount, total }) {
  const list = readAll();
  const now = new Date().toISOString();
  const order = {
    id: 'o' + crypto.randomBytes(6).toString('hex'),
    orderNumber: generateOrderNumber(),
    status: 'nouvelle',
    customer,
    shipping,
    payment,
    items,
    subtotal,
    shippingCost,
    discount,
    total,
    emailSent: false,
    createdAt: now,
    updatedAt: now,
  };
  list.push(order);
  writeAll(list);
  return order;
}

function updateStatus(id, status) {
  if (!STATUSES.includes(status)) {
    const err = new Error('Statut invalide.');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const list = readAll();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  list[idx].status = status;
  list[idx].updatedAt = new Date().toISOString();
  writeAll(list);
  return list[idx];
}

function markEmailSent(id, sent) {
  const list = readAll();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return;
  list[idx].emailSent = sent;
  writeAll(list);
}

module.exports = {
  STATUSES,
  STATUS_LABELS,
  getAll,
  getById,
  create,
  updateStatus,
  markEmailSent,
};

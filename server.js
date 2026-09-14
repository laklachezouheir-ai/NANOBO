require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');

const config = require('./lib/config');
const adminAuth = require('./lib/adminAuth');
const products = require('./lib/productsStore');
const categories = require('./lib/categoriesStore');
const siteSettings = require('./lib/siteSettingsStore');
const orders = require('./lib/ordersStore');
const mailer = require('./lib/mailer');
const r2 = require('./lib/r2');
const telegram = require('./lib/telegram');
const insights = require('./lib/insights');
const claudeVision = require('./lib/claudeVision');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo par image
  fileFilter(_req, file, cb) {
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)) {
      return cb(new Error('Format d’image non supporté (jpeg, png, webp, gif, avif uniquement).'));
    }
    cb(null, true);
  },
});

/* ============================================================
   API publique — consommée par les pages de la boutique
   ============================================================ */

function toPublicShape(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    ageGroup: p.ageGroup,
    badge: p.badge,
    price: p.price,
    oldPrice: p.oldPrice,
    sku: p.sku,
    inStock: p.stock > 0,
    sizes: p.sizes,
    colors: p.colors,
    shortDescription: p.shortDescription,
    description: p.description,
    details: p.details,
    images: p.images,
    icon: p.icon,
    palette: p.palette,
    seo: p.seo,
    rating: p.rating,
    reviews: p.reviews,
    tags: p.tags,
  };
}

app.get('/api/products', (_req, res) => {
  res.json({ products: products.getPublished().map(toPublicShape) });
});

app.get('/api/products/:slug', (req, res) => {
  const p = products.getBySlug(req.params.slug);
  if (!p || p.status !== 'published') {
    return res.status(404).json({ error: 'Produit introuvable.' });
  }
  res.json({ product: toPublicShape(p) });
});

app.get('/api/categories', (_req, res) => {
  res.json({ categories: categories.getVisible() });
});

app.get('/api/site-settings', (_req, res) => {
  res.json({ settings: siteSettings.get() });
});

/* ---------- Import rapide de produits depuis Telegram ---------- */

// Appelé par Telegram (voir setWebhook) à chaque message reçu par le bot.
// Sécurisé par un identifiant de chat autorisé (voir lib/telegram.js),
// pas par une session admin classique : ce n'est pas un appel du navigateur.
app.post('/api/telegram/webhook', async (req, res) => {
  // Important : on attend la fin complète du traitement (téléchargement de
  // la photo, upload R2, sauvegarde du produit sur R2) AVANT de répondre à
  // Telegram. Répondre 200 immédiatement puis continuer en arrière-plan
  // semblait plus rapide, mais sur Render, si le conteneur est recyclé
  // juste après (redéploiement, ou mise en veille du plan gratuit) avant
  // que ce travail en arrière-plan soit terminé, la sauvegarde sur R2 est
  // silencieusement perdue — le produit disparaît alors au démarrage
  // suivant, sans aucune erreur visible. Le télécharg+upload prend
  // généralement 1 à 5 secondes, largement dans la tolérance de Telegram.
  if (!telegram.isConfigured()) {
    res.status(200).end();
    return;
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  try {
    await telegram.handleUpdate(req.body || {}, baseUrl);
  } catch (err) {
    console.error('Erreur traitement webhook Telegram:', err);
  }
  res.status(200).end();
});

/* ---------- Commandes (créées depuis le tunnel de commande public) ---------- */

app.post('/api/orders', async (req, res) => {
  const { customer, shipping, payment, cart } = req.body || {};

  if (!customer?.email || !customer?.firstName || !customer?.lastName) {
    return res.status(400).json({ error: 'Informations client incomplètes.' });
  }
  if (!shipping?.address || !shipping?.city || !shipping?.postalCode || !shipping?.country) {
    return res.status(400).json({ error: 'Adresse de livraison incomplète.' });
  }
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide.' });
  }

  // Les prix et noms sont toujours recalculés côté serveur à partir du
  // catalogue réel : on ne fait jamais confiance aux montants envoyés par
  // le navigateur.
  const items = [];
  for (const line of cart) {
    const p = products.getById(line.id);
    if (!p || p.status !== 'published') continue;
    const qty = Math.max(1, Math.min(99, parseInt(line.qty, 10) || 1));
    items.push({
      productId: p.id,
      name: p.name,
      image: p.images && p.images[0] ? p.images[0].url : null,
      icon: p.icon,
      palette: p.palette,
      size: line.size || null,
      color: line.color || null,
      qty,
      price: p.price,
    });
  }

  if (!items.length) {
    return res.status(400).json({ error: 'Aucun article valide dans le panier.' });
  }

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const shippingCost = 0; // Livraison gratuite sur toutes les commandes
  const discount = 0;
  const total = subtotal + shippingCost - discount;

  const order = await orders.create({
    customer: {
      firstName: String(customer.firstName).trim(),
      lastName: String(customer.lastName).trim(),
      email: String(customer.email).trim(),
      phone: String(customer.phone || '').trim(),
    },
    shipping: {
      address: String(shipping.address).trim(),
      city: String(shipping.city).trim(),
      postalCode: String(shipping.postalCode).trim(),
      country: String(shipping.country).trim(),
      instructions: String(shipping.instructions || '').trim(),
    },
    payment: { method: (payment && payment.method) || 'cod' },
    items,
    subtotal,
    shippingCost,
    discount,
    total,
  });

  // Envoi de l'e-mail de confirmation en best-effort : un échec d'envoi ne
  // doit jamais faire échouer la commande elle-même.
  if (mailer.isConfigured()) {
    mailer
      .sendOrderConfirmation(order)
      .then(() => orders.markEmailSent(order.id, true))
      .catch((err) => console.error('Échec envoi e-mail de confirmation:', err.message));
  }

  res.status(201).json({ order: { id: order.id, orderNumber: order.orderNumber, total: order.total } });
});

/* ============================================================
   Authentification admin
   ============================================================ */

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  const { password: expected } = config.getAdminPassword();
  const submitted = typeof password === 'string' ? password.trim() : '';

  if (!submitted || !adminAuth.timingSafeEqualStrings(submitted, expected)) {
    return res.status(401).json({ code: 'INVALID_PASSWORD', error: 'Mot de passe incorrect.' });
  }

  const token = adminAuth.createSession();
  res.setHeader(
    'Set-Cookie',
    `${adminAuth.COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`
  );
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  const cookies = adminAuth.parseCookies(req.headers.cookie);
  adminAuth.destroySession(cookies[adminAuth.COOKIE_NAME]);
  res.setHeader('Set-Cookie', `${adminAuth.COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`);
  res.json({ ok: true });
});

app.get('/api/admin/session', (req, res) => {
  const cookies = adminAuth.parseCookies(req.headers.cookie);
  res.json({ authenticated: adminAuth.isValidSession(cookies[adminAuth.COOKIE_NAME]) });
});

/* Tout ce qui suit exige une session admin valide. */
app.use('/api/admin', adminAuth.requireAdmin);

app.get('/api/admin/meta', (_req, res) => {
  res.json({
    categories: categories.getAllSorted(),
    badges: products.BADGES,
    statuses: products.STATUSES,
    orderStatuses: orders.STATUSES,
    orderStatusLabels: orders.STATUS_LABELS,
    imageStorageConfigured: r2.isConfigured(),
    mailConfigured: mailer.isConfigured(),
    aiConfigured: insights.isConfigured(),
  });
});

/* ---------- Résumé des ventes (IA, sur demande) ---------- */

app.post('/api/admin/insights', async (req, res) => {
  if (!insights.isConfigured()) {
    return res.status(503).json({
      code: 'AI_NOT_CONFIGURED',
      error: "DeepSeek n'est pas configuré sur ce serveur. Ajoutez DEEPSEEK_API_KEY dans les variables d'environnement.",
    });
  }
  try {
    const result = await insights.generateSalesInsight(orders.getAll(), products.getAll(), categories.getAllSorted());
    res.json(result);
  } catch (err) {
    console.error('Erreur génération résumé des ventes:', err);
    res.status(500).json({ error: 'Échec de la génération du résumé.' });
  }
});

/* ---------- Catégories (CRUD complet) ---------- */

app.get('/api/admin/categories', (_req, res) => {
  const list = categories.getAllSorted();
  const allProducts = products.getAll();
  const withCounts = list.map((c) => ({
    ...c,
    productCount: allProducts.filter((p) => p.category === c.id).length,
  }));
  res.json({ categories: withCounts });
});

app.post('/api/admin/categories', async (req, res) => {
  try {
    const category = await categories.create(req.body || {});
    res.status(201).json({ category });
  } catch (err) {
    res.status(err.code === 'VALIDATION_ERROR' ? 400 : 500).json({ error: err.message });
  }
});

app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    const category = await categories.update(req.params.id, req.body || {});
    if (!category) return res.status(404).json({ error: 'Catégorie introuvable.' });
    res.json({ category });
  } catch (err) {
    res.status(err.code === 'VALIDATION_ERROR' ? 400 : 500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
  const inUse = products.getAll().filter((p) => p.category === req.params.id).length;
  if (inUse > 0 && req.query.force !== '1') {
    return res.status(409).json({
      code: 'CATEGORY_IN_USE',
      error: `${inUse} produit(s) utilisent encore cette catégorie.`,
      productCount: inUse,
    });
  }
  const ok = await categories.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Catégorie introuvable.' });
  res.json({ ok: true });
});

/* ---------- Commandes (gestion admin) ---------- */

app.get('/api/admin/orders', (_req, res) => {
  res.json({ orders: orders.getAll() });
});

app.get('/api/admin/orders/:id', (req, res) => {
  const o = orders.getById(req.params.id);
  if (!o) return res.status(404).json({ error: 'Commande introuvable.' });
  res.json({ order: o });
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const o = await orders.updateStatus(req.params.id, req.body?.status);
    if (!o) return res.status(404).json({ error: 'Commande introuvable.' });
    res.json({ order: o });
  } catch (err) {
    res.status(err.code === 'VALIDATION_ERROR' ? 400 : 500).json({ error: err.message });
  }
});

app.post('/api/admin/orders/:id/resend-email', async (req, res) => {
  const o = orders.getById(req.params.id);
  if (!o) return res.status(404).json({ error: 'Commande introuvable.' });
  if (!mailer.isConfigured()) {
    return res.status(503).json({
      code: 'MAIL_NOT_CONFIGURED',
      error: "L'envoi d'e-mails (Resend) n'est pas configuré sur ce serveur. Ajoutez RESEND_API_KEY dans les variables d'environnement.",
    });
  }
  try {
    await mailer.sendOrderConfirmation(o);
    await orders.markEmailSent(o.id, true);
    res.json({ ok: true });
  } catch (err) {
    console.error('Échec renvoi e-mail de confirmation:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- Personnalisation de l'accueil (hero, bannière, Instagram) ---------- */

app.get('/api/admin/site-settings', (_req, res) => {
  res.json({ settings: siteSettings.get() });
});

app.put('/api/admin/site-settings', async (req, res) => {
  const settings = await siteSettings.update(req.body || {});
  res.json({ settings });
});

/* ---------- Produits (CRUD complet) ---------- */

app.get('/api/admin/products', (_req, res) => {
  res.json({ products: products.getAll() });
});

app.get('/api/admin/products/:id', (req, res) => {
  const p = products.getById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Produit introuvable.' });
  res.json({ product: p });
});

app.post('/api/admin/products', async (req, res) => {
  try {
    const product = await products.create(req.body || {});
    res.status(201).json({ product });
  } catch (err) {
    res.status(err.code === 'VALIDATION_ERROR' ? 400 : 500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const product = await products.update(req.params.id, req.body || {});
    if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
    res.json({ product });
  } catch (err) {
    res.status(err.code === 'VALIDATION_ERROR' ? 400 : 500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  const p = products.getById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Produit introuvable.' });

  // Nettoyage best-effort des images R2 associées.
  if (r2.isConfigured() && Array.isArray(p.images)) {
    await Promise.all(
      p.images.map((img) => r2.deleteProductImage(img.key).catch(() => {}))
    );
  }

  await products.remove(req.params.id);
  res.json({ ok: true });
});

/* ---------- Upload & gestion des photos produit ---------- */

app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
  if (!r2.isConfigured()) {
    return res.status(503).json({
      code: 'R2_NOT_CONFIGURED',
      error:
        "Le stockage d'images (Cloudflare R2) n'est pas configuré sur ce serveur. Ajoutez R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME et R2_PUBLIC_URL dans les variables d'environnement pour activer l'upload et l'optimisation des photos."
    });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image reçue.' });
  }

  try {
    const productId = (req.body?.productId || 'temp').toString().replace(/[^a-z0-9_-]/gi, '');
    const result = await r2.uploadProductImage(req.file.buffer, { productId });
    res.status(201).json({
      image: {
        url: result.url,
        key: result.key,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        originalBytes: req.file.size,
      },
    });
  } catch (err) {
    console.error('Erreur upload R2:', err);
    res.status(500).json({
      error: "Échec de l'upload de l'image. Réessayez.",
      detail: err.message || String(err),
    });
  }
});

app.post('/api/admin/images/delete', async (req, res) => {
  const { key } = req.body || {};
  if (!key) return res.status(400).json({ error: 'key manquante.' });
  if (!r2.isConfigured()) {
    return res.status(503).json({ error: "Le stockage d'images (Cloudflare R2) n'est pas configuré." });
  }
  try {
    await r2.deleteProductImage(key);
    r2.evictFromMediaCache(key);
    res.json({ ok: true });
  } catch (err) {
    console.error('Erreur suppression R2:', err);
    res.status(500).json({ error: "Échec de la suppression de l'image." });
  }
});

// Sert les photos stockées sur R2 via notre propre domaine, plutôt que via
// l'URL publique R2 (r2.dev) : cette dernière ne charge pas de façon fiable
// en <img> intégrée depuis un autre site (Cloudflare la réserve aux tests,
// pas à la production). En passant par notre serveur, le navigateur ne voit
// qu'une seule origine (nanobo.onrender.com), sans ce souci.
app.get('/media/*', async (req, res) => {
  const key = req.params[0];
  if (!key || !r2.isConfigured()) return res.status(404).end();
  try {
    const { buffer, contentType } = await r2.getObject(key);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(buffer);
  } catch (err) {
    if (err.name === 'NoSuchKey') return res.status(404).end();
    console.error('Erreur lecture R2:', err);
    res.status(500).end();
  }
});

// Messages d'erreur multer (taille/format) renvoyés proprement en JSON.
app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError || (err && /image/i.test(err.message))) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

/* ============================================================
   Pages d'administration (protégées côté client par /api/admin/session)
   ============================================================ */

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});
app.get('/admin/produits/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'produit.html'));
});
app.get('/admin/categories', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'categories.html'));
});
app.get('/admin/accueil', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'accueil.html'));
});
app.get('/admin/commandes', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'commandes.html'));
});
app.get('/admin/commandes/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'commande.html'));
});

app.get('/api/health', (_req, res) => {
  const { source: adminPasswordSource } = config.getAdminPassword();
  res.json({
    status: 'ok',
    productsCount: products.getAll().length,
    imageStorageConfigured: r2.isConfigured(),
    adminPasswordSource,
  });
});

async function start() {
  // Récupère la dernière version connue des données (produits, catégories,
  // commandes, personnalisation de l'accueil) depuis Cloudflare R2 avant de
  // démarrer : sans ça, chaque redéploiement de code repartirait des
  // fichiers du dépôt git et effacerait tout ce qui a été ajouté depuis
  // l'admin ou Telegram. Voir lib/persistence.js.
  await Promise.all([products.init(), categories.init(), orders.init(), siteSettings.init()]);

  app.listen(PORT, () => {
    console.log(`NANOBO est lancé sur http://localhost:${PORT}`);

    const { password, generated } = config.getAdminPassword();
    if (generated) {
      console.log('');
      console.log('========================================================');
      console.log(' Mot de passe administrateur généré automatiquement :');
      console.log(` ${password}`);
      console.log(' Connectez-vous sur /admin pour gérer le catalogue produit.');
      console.log(' (Définissez ADMIN_PASSWORD dans .env pour choisir le vôtre.)');
      console.log('========================================================');
      console.log('');
    } else {
      console.log("Interface d'administration disponible sur /admin.");
    }

    if (!r2.isConfigured()) {
      console.log(
        '⚠️  Cloudflare R2 non configuré : l’upload de photos produit sera indisponible tant que R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME et R2_PUBLIC_URL ne sont pas définis. Les données (produits, commandes...) ne survivront pas non plus aux redéploiements tant que R2 n’est pas configuré.'
      );
    }
    if (!mailer.isConfigured()) {
      console.log(
        '⚠️  Resend non configuré : les e-mails de confirmation de commande ne seront pas envoyés tant que RESEND_API_KEY n’est pas définie.'
      );
    }
    if (!telegram.isConfigured()) {
      console.log(
        '⚠️  Bot Telegram non configuré : l’import rapide de produits depuis Telegram sera indisponible tant que TELEGRAM_BOT_TOKEN n’est pas définie.'
      );
    }
    if (!insights.isConfigured()) {
      console.log(
        '⚠️  DeepSeek non configuré : le résumé des ventes (admin) sera indisponible tant que DEEPSEEK_API_KEY n’est pas définie.'
      );
    }
    if (!claudeVision.isConfigured()) {
      console.log(
        '⚠️  Claude (ANTHROPIC_API_KEY) non configuré : les imports Telegram sans description/catégorie ne pourront pas être analysés depuis la photo (repli sur DeepSeek en texte seul, si configuré).'
      );
    }
  });
}

start().catch((err) => {
  console.error('Erreur au démarrage du serveur:', err);
  process.exit(1);
});

require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');

const config = require('./lib/config');
const adminAuth = require('./lib/adminAuth');
const products = require('./lib/productsStore');
const cloudinaryLib = require('./lib/cloudinary');

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
    categories: products.CATEGORIES,
    badges: products.BADGES,
    statuses: products.STATUSES,
    cloudinaryConfigured: cloudinaryLib.isConfigured(),
  });
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

app.post('/api/admin/products', (req, res) => {
  try {
    const product = products.create(req.body || {});
    res.status(201).json({ product });
  } catch (err) {
    res.status(err.code === 'VALIDATION_ERROR' ? 400 : 500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', (req, res) => {
  try {
    const product = products.update(req.params.id, req.body || {});
    if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
    res.json({ product });
  } catch (err) {
    res.status(err.code === 'VALIDATION_ERROR' ? 400 : 500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  const p = products.getById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Produit introuvable.' });

  // Nettoyage best-effort des images Cloudinary associées.
  if (cloudinaryLib.isConfigured() && Array.isArray(p.images)) {
    await Promise.all(
      p.images.map((img) => cloudinaryLib.deleteProductImage(img.publicId).catch(() => {}))
    );
  }

  products.remove(req.params.id);
  res.json({ ok: true });
});

/* ---------- Upload & gestion des photos produit ---------- */

app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
  if (!cloudinaryLib.isConfigured()) {
    return res.status(503).json({
      code: 'CLOUDINARY_NOT_CONFIGURED',
      error:
        "Cloudinary n'est pas configuré sur ce serveur. Ajoutez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans les variables d'environnement pour activer l'upload et l'optimisation des photos.",
    });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image reçue.' });
  }

  try {
    const productId = (req.body?.productId || 'temp').toString().replace(/[^a-z0-9_-]/gi, '');
    const result = await cloudinaryLib.uploadProductImage(req.file.buffer, { productId });
    res.status(201).json({
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        originalBytes: req.file.size,
      },
    });
  } catch (err) {
    console.error('Erreur upload Cloudinary:', err);
    res.status(500).json({ error: "Échec de l'upload de l'image. Réessayez." });
  }
});

app.post('/api/admin/images/delete', async (req, res) => {
  const { publicId } = req.body || {};
  if (!publicId) return res.status(400).json({ error: 'publicId manquant.' });
  if (!cloudinaryLib.isConfigured()) {
    return res.status(503).json({ error: "Cloudinary n'est pas configuré." });
  }
  try {
    await cloudinaryLib.deleteProductImage(publicId);
    res.json({ ok: true });
  } catch (err) {
    console.error('Erreur suppression Cloudinary:', err);
    res.status(500).json({ error: "Échec de la suppression de l'image." });
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

app.get('/api/health', (_req, res) => {
  const { source: adminPasswordSource } = config.getAdminPassword();
  res.json({
    status: 'ok',
    productsCount: products.getAll().length,
    cloudinaryConfigured: cloudinaryLib.isConfigured(),
    adminPasswordSource,
  });
});

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

  if (!cloudinaryLib.isConfigured()) {
    console.log(
      '⚠️  Cloudinary non configuré : l’upload de photos produit sera indisponible tant que CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET ne sont pas définis.'
    );
  }
});

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'siteSettings.json');

/* Valeurs par défaut = contenu d'origine de l'accueil. Tant qu'un champ
   n'a pas été personnalisé depuis /admin/accueil, c'est cette valeur qui
   s'affiche : le site reste identique à sa version codée en dur. */
const DEFAULTS = {
  hero: {
    eyebrow: '✨ Nouvelle collection Printemps',
    headline: 'Des tenues qui donnent le sourire à chaque aventure',
    highlight: 'sourire',
    lead: "Vêtements doux, colorés et résistants, pensés pour accompagner les petites aventures du quotidien — de la crèche à la cour de récré.",
    ctaPrimaryText: 'Découvrir la boutique',
    ctaPrimaryLink: 'boutique.html',
    ctaSecondaryText: 'Voir les soldes',
    ctaSecondaryLink: 'boutique.html?sale=1',
    stat1Value: '12k+',
    stat1Label: 'Familles conquises',
    stat2Value: '4.8/5',
    stat2Label: 'Note moyenne',
    stat3Value: '48h',
    stat3Label: 'Livraison express',
    badgeTopText: 'Livraison en 48h',
    badgeBottomText: 'Retours gratuits 30j',
    images: [
      { url: '/images/hero/hero-catdress.webp', key: null },
      { url: '/images/hero/hero-floral.webp', key: null },
      { url: '/images/hero/hero-boyjeans.webp', key: null },
      { url: '/images/hero/hero-leopard.webp', key: null },
    ], // jusqu'à 5 {url, key} — plusieurs photos défilent en fondu ; aucune = pictogramme "dress" par défaut
  },
  promoBanner: {
    tag: 'Offre limitée',
    heading: 'Soldes de saison, jusqu\'à -30%',
    text: "Toute la collection été à petit prix, pendant un temps limité seulement. Les meilleures pièces partent vite !",
    ctaText: "J'en profite",
    ctaLink: 'boutique.html?sale=1',
  },
  instagram: {
    handle: '@nanobo.kids',
    images: [
      { url: '/images/instagram/insta-1.webp', key: null },
      { url: '/images/instagram/insta-2.webp', key: null },
      { url: '/images/instagram/insta-3.webp', key: null },
      { url: '/images/instagram/insta-4.webp', key: null },
    ], // jusqu'à 6 {url, key} — sinon les pictogrammes par défaut sont utilisés
  },
};

function readRaw() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function write(settings) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n', 'utf8');
}

function get() {
  const stored = readRaw();
  return {
    hero: { ...DEFAULTS.hero, ...(stored.hero || {}) },
    promoBanner: { ...DEFAULTS.promoBanner, ...(stored.promoBanner || {}) },
    instagram: { ...DEFAULTS.instagram, ...(stored.instagram || {}) },
  };
}

function update(patch) {
  const current = get();
  const next = {
    hero: { ...current.hero, ...(patch.hero || {}) },
    promoBanner: { ...current.promoBanner, ...(patch.promoBanner || {}) },
    instagram: { ...current.instagram, ...(patch.instagram || {}) },
  };
  if (Array.isArray(patch.hero?.images)) {
    next.hero.images = patch.hero.images.slice(0, 5);
  }
  if (Array.isArray(patch.instagram?.images)) {
    next.instagram.images = patch.instagram.images.slice(0, 6);
  }
  write(next);
  return next;
}

module.exports = { get, update, DEFAULTS };

const crypto = require('crypto');

// Sessions admin en mémoire (suffisant pour une app mono-instance très simple).
const sessions = new Set();

const COOKIE_NAME = 'nanobo_admin_session';

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.add(token);
  return token;
}

function isValidSession(token) {
  return Boolean(token) && sessions.has(token);
}

function destroySession(token) {
  sessions.delete(token);
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

function timingSafeEqualStrings(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Compare quand même contre un buffer de même taille pour éviter les
    // fuites de timing liées à la longueur.
    crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Middleware Express : exige une session admin valide (réponse JSON 401). */
function requireAdmin(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  if (!isValidSession(cookies[COOKIE_NAME])) {
    return res.status(401).json({ error: 'Non authentifié.' });
  }
  next();
}

/** Middleware Express : exige une session admin valide, sinon redirige vers /admin. */
function requireAdminPage(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  if (!isValidSession(cookies[COOKIE_NAME])) {
    return res.redirect('/admin');
  }
  next();
}

module.exports = {
  COOKIE_NAME,
  createSession,
  isValidSession,
  destroySession,
  parseCookies,
  timingSafeEqualStrings,
  requireAdmin,
  requireAdminPage,
};

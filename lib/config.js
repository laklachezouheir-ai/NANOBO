const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeConfig(config) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

/**
 * Mot de passe d'administration : priorité à la variable d'environnement
 * ADMIN_PASSWORD. À défaut, un mot de passe est généré automatiquement au
 * premier démarrage, enregistré localement, et affiché dans les logs du
 * serveur pour que l'utilisateur puisse se connecter à /admin.
 */
function getAdminPassword() {
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  if (envPassword) {
    return { password: envPassword, generated: false, source: 'env' };
  }

  const config = readConfig();
  if (config.adminPassword) {
    return { password: config.adminPassword, generated: false, source: 'generated' };
  }

  const generated = crypto.randomBytes(9).toString('base64url');
  config.adminPassword = generated;
  writeConfig(config);
  return { password: generated, generated: true, source: 'generated' };
}

/**
 * Identifiants Cloudflare R2 (upload & stockage des photos produit).
 * Toujours lus depuis les variables d'environnement : ce sont des secrets,
 * ils ne sont pas éditables depuis l'interface d'administration.
 */
function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) return null;
  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

/**
 * Identifiants Resend (envoi des e-mails de confirmation de commande).
 * Toujours lus depuis les variables d'environnement.
 */
function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'NANOBO <onboarding@resend.dev>';
  return { apiKey, fromEmail };
}

module.exports = { getAdminPassword, getR2Config, getResendConfig };

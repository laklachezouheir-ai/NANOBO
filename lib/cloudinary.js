const { v2: cloudinary } = require('cloudinary');
const { getCloudinaryConfig } = require('./config');

let configured = false;

function ensureConfigured() {
  const creds = getCloudinaryConfig();
  if (!creds) {
    const err = new Error(
      "Cloudinary n'est pas configuré. Renseignez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans les variables d'environnement."
    );
    err.code = 'CLOUDINARY_NOT_CONFIGURED';
    throw err;
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
      secure: true,
    });
    configured = true;
  }
  return creds;
}

function isConfigured() {
  return Boolean(getCloudinaryConfig());
}

/**
 * Upload un buffer image vers Cloudinary, dans le dossier nanobo/products.
 * Cloudinary optimise et compresse automatiquement le fichier stocké
 * (format et qualité "auto" appliqués à la livraison), et génère les
 * transformations à la volée : on ne stocke qu'un seul original.
 */
function uploadProductImage(buffer, { productId, filenameHint } = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const folder = productId ? `nanobo/products/${productId}` : 'nanobo/products/_uploads';
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Limite raisonnable : évite de stocker des originaux énormes.
        transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
        public_id: filenameHint ? filenameHint.replace(/[^a-z0-9-_]/gi, '').slice(0, 60) : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function deleteProductImage(publicId) {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

/**
 * Construit une URL de livraison optimisée (format + qualité automatiques,
 * recadrage carré) pour une taille donnée, à partir du public_id Cloudinary.
 * Utilisé pour générer miniatures / images de fiche produit / images de
 * grille sans dupliquer de fichiers.
 */
function buildImageUrl(publicId, { width = 800, height = 800, crop = 'fill' } = {}) {
  const creds = getCloudinaryConfig();
  if (!creds || !publicId) return null;
  return cloudinary.url(publicId, {
    cloud_name: creds.cloudName,
    secure: true,
    transformation: [{ width, height, crop, gravity: 'auto', fetch_format: 'auto', quality: 'auto' }],
  });
}

module.exports = { isConfigured, uploadProductImage, deleteProductImage, buildImageUrl };

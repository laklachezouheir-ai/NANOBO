const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { getR2Config } = require('./config');

let client = null;
let clientAccountId = null;

function getClient() {
  const creds = getR2Config();
  if (!creds) {
    const err = new Error(
      "Cloudflare R2 n'est pas configuré. Renseignez R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME et R2_PUBLIC_URL dans les variables d'environnement."
    );
    err.code = 'R2_NOT_CONFIGURED';
    throw err;
  }
  if (!client || clientAccountId !== creds.accountId) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${creds.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
      },
    });
    clientAccountId = creds.accountId;
  }
  return { client, creds };
}

function isConfigured() {
  return Boolean(getR2Config());
}

/**
 * Optimise puis upload une image produit vers R2.
 * Contrairement à Cloudinary, R2 ne transforme pas les images à la volée :
 * l'optimisation (recadrage à une taille max raisonnable, compression,
 * conversion en WebP) est donc faite ici, une seule fois, avant l'upload.
 */
async function uploadProductImage(buffer, { productId, filenameHint } = {}) {
  const { client, creds } = getClient();

  const optimized = await sharp(buffer)
    .rotate() // respecte l'orientation EXIF avant de la retirer
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const folder = productId ? `products/${productId}` : 'products/_uploads';
  const baseName = filenameHint
    ? filenameHint.replace(/[^a-z0-9-_]/gi, '').slice(0, 60)
    : crypto.randomBytes(8).toString('hex');
  const key = `${folder}/${baseName || crypto.randomBytes(8).toString('hex')}-${Date.now()}.webp`;

  await client.send(
    new PutObjectCommand({
      Bucket: creds.bucketName,
      Key: key,
      Body: optimized.data,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return {
    key,
    url: `${creds.publicUrl.replace(/\/$/, '')}/${key}`,
    width: optimized.info.width,
    height: optimized.info.height,
    bytes: optimized.info.size,
    format: 'webp',
  };
}

async function deleteProductImage(key) {
  const { client, creds } = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: creds.bucketName, Key: key }));
}

module.exports = { isConfigured, uploadProductImage, deleteProductImage };

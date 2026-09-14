/* =========================================================
   NANOBO — Import rapide de produits depuis Telegram
   L'utilisateur transfère une photo de produit (avec légende) à son bot
   Telegram personnel ; le bot télécharge la photo, l'optimise et
   l'envoie sur R2 (même pipeline que l'upload depuis l'admin), puis
   crée un produit brouillon prêt à être complété dans /admin.
   ========================================================= */

const { getTelegramConfig } = require('./config');
const products = require('./productsStore');
const r2 = require('./r2');

function isConfigured() {
  return Boolean(getTelegramConfig());
}

function apiUrl(botToken, method) {
  return `https://api.telegram.org/bot${botToken}/${method}`;
}

async function sendMessage(botToken, chatId, text) {
  try {
    await fetch(apiUrl(botToken, 'sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error('Erreur envoi message Telegram:', err.message);
  }
}

async function downloadTelegramFile(botToken, fileId) {
  const fileInfoRes = await fetch(apiUrl(botToken, 'getFile') + `?file_id=${encodeURIComponent(fileId)}`);
  const fileInfo = await fileInfoRes.json();
  if (!fileInfo.ok) throw new Error('Impossible de récupérer le fichier depuis Telegram.');
  const filePath = fileInfo.result.file_path;
  const fileRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
  if (!fileRes.ok) throw new Error('Échec du téléchargement du fichier Telegram.');
  const arrayBuffer = await fileRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Traite une mise à jour ("update") reçue du webhook Telegram. Best-effort :
 * toute erreur est journalisée et répondue à l'utilisateur plutôt que de
 * faire échouer la requête webhook (Telegram réessaierait sinon en boucle).
 */
async function handleUpdate(update, baseUrl) {
  const config = getTelegramConfig();
  if (!config) return; // pas de token configuré : on ignore silencieusement

  const message = update.message || update.channel_post;
  if (!message || !message.chat) return;
  const chatId = message.chat.id;

  // Tant que le propriétaire n'a pas renseigné TELEGRAM_ALLOWED_CHAT_ID,
  // le bot ne fait que révéler l'identifiant de chat (pour le configurer),
  // sans jamais créer de produit — ça évite que n'importe qui tombant sur
  // le bot puisse créer des brouillons.
  if (!config.allowedChatId) {
    await sendMessage(
      config.botToken,
      chatId,
      `Bot NANOBO connecté ✅\n\nTon identifiant de chat est : ${chatId}\n\nAjoute-le dans les variables d'environnement Render sous le nom TELEGRAM_ALLOWED_CHAT_ID pour activer la création de produits (sinon, par sécurité, personne ne peut en créer).`
    );
    return;
  }

  if (String(chatId) !== String(config.allowedChatId)) {
    // Chat non autorisé : on ignore silencieusement (pas de réponse), pour
    // ne pas confirmer à un tiers que le bot fait quelque chose.
    return;
  }

  const photos = message.photo;
  if (!Array.isArray(photos) || !photos.length) {
    await sendMessage(
      config.botToken,
      chatId,
      "Envoie-moi une photo de produit (avec une légende si possible : nom, prix...) et je créerai un brouillon dans l'admin NANOBO."
    );
    return;
  }

  try {
    // Telegram fournit plusieurs tailles de la même photo, du plus petit
    // au plus grand : on prend la plus grande pour la meilleure qualité.
    const largestPhoto = photos[photos.length - 1];
    const buffer = await downloadTelegramFile(config.botToken, largestPhoto.file_id);

    if (!r2.isConfigured()) {
      await sendMessage(
        config.botToken,
        chatId,
        "Le stockage des photos (Cloudflare R2) n'est pas configuré sur le serveur — impossible de créer le produit pour l'instant."
      );
      return;
    }

    const uploaded = await r2.uploadProductImage(buffer, { productId: 'telegram-import' });

    const caption = String(message.caption || '').trim();
    const name = caption ? caption.split('\n')[0].slice(0, 80) : 'Nouveau produit (Telegram) — à compléter';

    const product = products.create({
      name,
      status: 'draft',
      price: 0,
      shortDescription: caption,
      description: caption,
      images: [uploaded],
    });

    await sendMessage(
      config.botToken,
      chatId,
      `Brouillon créé ✅ : "${product.name}"\n\nComplète le prix, la catégorie et la description dans l'admin :\n${baseUrl}/admin/produits/${product.id}`
    );
  } catch (err) {
    console.error('Erreur import produit Telegram:', err);
    await sendMessage(config.botToken, chatId, "Échec de la création du produit. Réessaie, ou vérifie que la photo n'est pas trop lourde.");
  }
}

module.exports = { isConfigured, handleUpdate };

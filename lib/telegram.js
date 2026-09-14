/* =========================================================
   NANOBO — Import rapide de produits depuis Telegram
   L'utilisateur transfère une ou plusieurs photos de produit (avec
   légende) à son bot Telegram personnel ; le bot télécharge les photos,
   les optimise et les envoie sur R2 (même pipeline que l'upload depuis
   l'admin), puis crée UN SEUL produit brouillon (avec toutes les photos),
   prêt à être complété dans /admin.

   Telegram envoie chaque photo d'un "album" (plusieurs photos envoyées
   d'un coup) comme un message séparé, partageant le même media_group_id.
   On accumule donc les photos d'un même groupe pendant quelques secondes
   avant de créer le produit, pour éviter de créer un produit par photo.
   ========================================================= */

const { getTelegramConfig } = require('./config');
const products = require('./productsStore');
const r2 = require('./r2');

// Délai d'attente après la dernière photo reçue d'un album avant de
// considérer le groupe complet et créer le produit (Telegram envoie les
// photos d'un même album en général en moins d'une seconde d'écart).
const GROUP_FINALIZE_DELAY_MS = 2500;

// media_group_id -> { chatId, images: [...], caption, timer }
const pendingGroups = new Map();

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
 * Lit une légende au format "Nom: ... / Prix: ... / Description: ..."
 * (chaque champ sur sa propre ligne, insensible à la casse). Renvoie les
 * champs trouvés, ou null pour ceux absents — pour laisser l'appelant
 * appliquer ses propres valeurs par défaut.
 */
function parseCaptionFields(caption) {
  const result = { name: null, price: null, description: null };
  if (!caption) return result;

  const fieldRe = /^\s*(nom|prix|description)\s*:\s*(.*)$/i;
  for (const line of caption.split('\n')) {
    const match = line.match(fieldRe);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key === 'nom' && value) {
      result.name = value;
    } else if (key === 'prix' && value) {
      const num = parseFloat(value.replace(',', '.').replace(/[^\d.]/g, ''));
      if (Number.isFinite(num)) result.price = num;
    } else if (key === 'description' && value) {
      result.description = value;
    }
  }
  return result;
}

async function createDraftProduct(botToken, baseUrl, chatId, images, caption) {
  const fields = parseCaptionFields(caption);
  const trimmedCaption = String(caption || '').trim();

  const name = fields.name
    ? fields.name.slice(0, 80)
    : trimmedCaption
    ? trimmedCaption.split('\n')[0].slice(0, 80)
    : 'Nouveau produit (Telegram) — à compléter';

  const description = fields.description || (fields.name ? '' : trimmedCaption);
  const price = fields.price != null ? fields.price : 0;

  const product = products.create({
    name,
    status: 'draft',
    price,
    shortDescription: description,
    description,
    images,
  });

  const photoWord = images.length > 1 ? `${images.length} photos` : '1 photo';
  await sendMessage(
    botToken,
    chatId,
    `Brouillon créé ✅ (${photoWord}) : "${product.name}"\n\nComplète le prix, la catégorie et la description dans l'admin :\n${baseUrl}/admin/produits/${product.id}`
  );
  return product;
}

async function handlePhotoMessage(config, message, baseUrl) {
  const { botToken } = config;
  const chatId = message.chat.id;
  const groupId = message.media_group_id || null;

  let buffer;
  try {
    // Telegram fournit plusieurs tailles de la même photo, du plus petit
    // au plus grand : on prend la plus grande pour la meilleure qualité.
    const largestPhoto = message.photo[message.photo.length - 1];
    buffer = await downloadTelegramFile(botToken, largestPhoto.file_id);
  } catch (err) {
    console.error('Erreur téléchargement photo Telegram:', err);
    await sendMessage(botToken, chatId, "Échec du téléchargement d'une photo. Réessaie.");
    return;
  }

  if (!r2.isConfigured()) {
    await sendMessage(
      botToken,
      chatId,
      "Le stockage des photos (Cloudflare R2) n'est pas configuré sur le serveur — impossible de créer le produit pour l'instant."
    );
    return;
  }

  let uploaded;
  try {
    uploaded = await r2.uploadProductImage(buffer, { productId: 'telegram-import' });
  } catch (err) {
    console.error('Erreur upload R2 depuis Telegram:', err);
    await sendMessage(botToken, chatId, "Échec de l'envoi d'une photo vers le stockage. Réessaie.");
    return;
  }

  if (!groupId) {
    // Photo seule (pas un album) : on crée le produit tout de suite.
    try {
      await createDraftProduct(botToken, baseUrl, chatId, [uploaded], message.caption);
    } catch (err) {
      console.error('Erreur création produit Telegram:', err);
      await sendMessage(botToken, chatId, 'Échec de la création du produit. Réessaie.');
    }
    return;
  }

  // Album : Telegram envoie chaque photo comme un message séparé partageant
  // le même media_group_id. On accumule les photos de ce groupe et on
  // (re)démarre un minuteur à chaque nouvelle photo reçue ; une fois le
  // minuteur écoulé sans nouvelle photo, on crée un seul produit avec
  // toutes les images accumulées.
  let entry = pendingGroups.get(groupId);
  if (!entry) {
    entry = { chatId, images: [], caption: null, timer: null };
    pendingGroups.set(groupId, entry);
  }
  entry.images.push(uploaded);
  // Seule une des photos de l'album porte en général la légende (celle
  // choisie par l'utilisateur au moment de l'envoi) : on la garde dès
  // qu'on la voit.
  if (message.caption && !entry.caption) entry.caption = message.caption;

  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = setTimeout(() => {
    pendingGroups.delete(groupId);
    createDraftProduct(botToken, baseUrl, entry.chatId, entry.images, entry.caption).catch((err) => {
      console.error('Erreur création produit (album) Telegram:', err);
      sendMessage(botToken, entry.chatId, 'Échec de la création du produit. Réessaie.');
    });
  }, GROUP_FINALIZE_DELAY_MS);
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
      "Envoie-moi une ou plusieurs photos du même produit (en album si besoin), avec si possible une légende au format :\n\nNom: ...\nPrix: ...\nDescription: ...\n\n(sinon, un brouillon à compléter dans l'admin sera créé quand même)"
    );
    return;
  }

  await handlePhotoMessage(config, message, baseUrl);
}

module.exports = { isConfigured, handleUpdate };

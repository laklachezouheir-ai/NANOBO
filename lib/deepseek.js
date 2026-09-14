/* =========================================================
   NANOBO — Intégration DeepSeek (IA texte)
   Utilisée pour : rédiger des descriptions produit, deviner la
   catégorie d'un produit à partir de son nom, et résumer les ventes
   pour l'admin. API compatible OpenAI (appel HTTP simple, pas de SDK
   officiel Node nécessaire). Modèle texte uniquement — ne peut pas
   analyser une photo.
   ========================================================= */

const { getDeepSeekConfig } = require('./config');

const API_URL = 'https://api.deepseek.com/chat/completions';

function isConfigured() {
  return Boolean(getDeepSeekConfig());
}

/**
 * Envoie une conversation à DeepSeek et renvoie le texte de la réponse.
 * `messages` suit le même format que l'API OpenAI : [{role, content}, ...].
 */
async function chat(messages, { temperature = 0.7, maxTokens = 400 } = {}) {
  const config = getDeepSeekConfig();
  if (!config) {
    const err = new Error("DeepSeek n'est pas configuré (DEEPSEEK_API_KEY manquante).");
    err.code = 'DEEPSEEK_NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Erreur DeepSeek (${res.status}) : ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

module.exports = { isConfigured, chat };

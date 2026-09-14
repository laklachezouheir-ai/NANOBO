/* =========================================================
   NANOBO — Analyse de photo produit par IA (Claude, vision)
   Contrairement à DeepSeek (texte uniquement), Claude peut regarder la
   photo elle-même pour rédiger une description qui correspond vraiment
   au produit visible, et proposer une catégorie basée sur ce qu'il voit.
   ========================================================= */

const Anthropic = require('@anthropic-ai/sdk');

function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error("ANTHROPIC_API_KEY n'est pas configurée.");
    err.code = 'CLAUDE_NOT_CONFIGURED';
    throw err;
  }
  return new Anthropic({ apiKey });
}

/** Extrait un objet JSON de la réponse, même entouré de texte ou de balises ```. */
function extractJson(text) {
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/**
 * Analyse une photo de produit (accessible via une URL publique — notre
 * propre serveur, voir GET /media/*) et propose une description courte,
 * une description détaillée, et une catégorie, basées sur ce qui est
 * réellement visible sur la photo. Renvoie null si la réponse n'est pas
 * exploitable ; lève une erreur si l'appel échoue (réseau, quota...) —
 * à gérer par l'appelant en best-effort.
 */
async function analyzeProductPhoto(imageUrl, { productName, categories } = {}) {
  const client = getClient();
  const categoryList = (categories || []).map((c) => `- ${c.id} : ${c.label}`).join('\n');

  const promptParts = [
    'Tu regardes la photo d\'un produit pour NANOBO, une boutique en ligne de vêtements pour enfants.',
    productName ? `Le produit s'appelle "${productName}".` : '',
    'Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour ni balises markdown, au format exact :',
    '{"shortDescription": "1 phrase courte et accrocheuse (max ~12 mots) décrivant ce que tu vois sur la photo", "description": "2 à 4 phrases détaillées décrivant précisément ce qui est visible sur la photo : type de vêtement, couleur(s), motifs, coupe, matière apparente, détails notables", "category": "identifiant exact d\'une de ces catégories, choisi selon ce que tu vois réellement sur la photo (enfant garçon ou fille, ou le type de vêtement) :\n' +
      categoryList,
    '"}',
    "Base-toi uniquement sur ce que tu vois réellement sur la photo, pas sur des suppositions.",
  ].filter(Boolean);

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 600,
    output_config: { effort: 'low' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: imageUrl } },
          { type: 'text', text: promptParts.join('\n') },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return extractJson(textBlock ? textBlock.text : '');
}

module.exports = { isConfigured, analyzeProductPhoto };

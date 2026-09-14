/* =========================================================
   NANOBO — Résumé des ventes pour l'admin (via DeepSeek)
   Calcule des statistiques détaillées (chiffre d'affaires, tendance,
   meilleures ventes, répartition par catégorie, stock...) affichées
   telles quelles côté admin, puis demande à DeepSeek une analyse en
   langage clair ET des conseils concrets pour améliorer les ventes —
   pas juste un rappel des chiffres.
   ========================================================= */

const deepseek = require('./deepseek');

function isConfigured() {
  return deepseek.isConfigured();
}

/** Regroupe les articles vendus (toutes commandes confondues) par produit. */
function aggregateSoldItems(allOrders) {
  const byProduct = new Map(); // productId -> { name, qty, revenue }
  for (const order of allOrders) {
    for (const item of order.items || []) {
      const key = item.productId || item.name;
      const entry = byProduct.get(key) || { name: item.name, qty: 0, revenue: 0 };
      entry.qty += item.qty || 0;
      entry.revenue += (item.price || 0) * (item.qty || 0);
      byProduct.set(key, entry);
    }
  }
  return [...byProduct.values()].sort((a, b) => b.qty - a.qty);
}

/** Calcule toutes les statistiques affichées côté admin (indépendant de l'IA). */
function computeStats(allOrders, allProducts, allCategories) {
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recentOrders = allOrders.filter((o) => now - new Date(o.createdAt).getTime() <= sevenDaysMs);
  const previousOrders = allOrders.filter((o) => {
    const age = now - new Date(o.createdAt).getTime();
    return age > sevenDaysMs && age <= 2 * sevenDaysMs;
  });
  const recentRevenue = recentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const trendPercent = previousRevenue > 0 ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100) : null;

  const byStatus = {};
  for (const o of allOrders) byStatus[o.status] = (byStatus[o.status] || 0) + 1;

  const soldItems = aggregateSoldItems(allOrders);
  const topSellers = soldItems.slice(0, 5);

  const categoryLabel = (id) => allCategories.find((c) => c.id === id)?.label || id || '(sans catégorie)';
  const revenueByCategory = new Map();
  for (const order of allOrders) {
    for (const item of order.items || []) {
      const product = allProducts.find((p) => p.id === item.productId);
      const cat = categoryLabel(product?.category);
      revenueByCategory.set(cat, (revenueByCategory.get(cat) || 0) + (item.price || 0) * (item.qty || 0));
    }
  }
  const categoriesRanked = [...revenueByCategory.entries()]
    .map(([label, revenue]) => ({ label, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const publishedCount = allProducts.filter((p) => p.status === 'published').length;
  const draftCount = allProducts.filter((p) => p.status === 'draft').length;
  const outOfStockCount = allProducts.filter((p) => p.status === 'published' && p.stock <= 0).length;

  // Produits publiés qui n'ont encore jamais été vendus — utile pour repérer
  // ce qui stagne (photos peu attractives, prix, mauvaise catégorie...).
  const soldProductIds = new Set(allOrders.flatMap((o) => (o.items || []).map((i) => i.productId)));
  const neverSoldPublished = allProducts.filter((p) => p.status === 'published' && !soldProductIds.has(p.id));

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue,
    recentOrders: recentOrders.length,
    recentRevenue,
    previousOrders: previousOrders.length,
    previousRevenue,
    trendPercent,
    byStatus,
    topSellers,
    categoriesRanked,
    publishedCount,
    draftCount,
    outOfStockCount,
    neverSoldCount: neverSoldPublished.length,
    neverSoldSample: neverSoldPublished.slice(0, 5).map((p) => p.name),
  };
}

function formatStatsForPrompt(stats) {
  const lines = [
    `Total commandes : ${stats.totalOrders}`,
    `Chiffre d'affaires total : ${stats.totalRevenue.toFixed(2)} MAD`,
    `Panier moyen : ${stats.avgOrderValue.toFixed(2)} MAD`,
    `7 derniers jours : ${stats.recentOrders} commandes, ${stats.recentRevenue.toFixed(2)} MAD`,
    `7 jours précédents : ${stats.previousOrders} commandes, ${stats.previousRevenue.toFixed(2)} MAD`,
    `Tendance sur 7 jours : ${stats.trendPercent == null ? 'pas assez de données' : (stats.trendPercent >= 0 ? '+' : '') + stats.trendPercent + '%'}`,
    `Répartition par statut : ${Object.entries(stats.byStatus).map(([s, n]) => `${s}=${n}`).join(', ') || 'aucune'}`,
    `Meilleures ventes (par quantité) : ${stats.topSellers.map((s) => `${s.name} (${s.qty} vendus, ${s.revenue.toFixed(2)} MAD)`).join(' ; ') || 'aucune vente pour le moment'}`,
    `Chiffre d'affaires par catégorie : ${stats.categoriesRanked.map((c) => `${c.label} = ${c.revenue.toFixed(2)} MAD`).join(' ; ') || 'aucun'}`,
    `Catalogue : ${stats.publishedCount} produits publiés, ${stats.draftCount} brouillons, ${stats.outOfStockCount} en rupture de stock`,
    `Produits publiés jamais vendus : ${stats.neverSoldCount}${stats.neverSoldSample.length ? ' (ex. ' + stats.neverSoldSample.join(', ') + ')' : ''}`,
  ];
  return lines.join('\n');
}

/** Extrait un objet JSON de la réponse du modèle, même s'il est entouré de texte ou de balises ```. */
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
 * Génère une analyse détaillée des ventes de la boutique : un texte
 * d'analyse (`summary`) et une liste de conseils concrets pour améliorer
 * les ventes (`tips`), en plus des statistiques brutes (`stats`, pour un
 * affichage direct côté admin). Lève une erreur si DeepSeek n'est pas
 * configuré ou si l'appel échoue — à gérer par l'appelant (route API).
 */
async function generateSalesInsight(allOrders, allProducts, allCategories) {
  const stats = computeStats(allOrders, allProducts, allCategories);

  if (!allOrders.length) {
    return {
      summary:
        "Pas encore de commande enregistrée — reviens ici une fois que tu auras reçu tes premières commandes pour voir une analyse de tes ventes.",
      tips: [
        'Partage le lien de ta boutique sur tes réseaux sociaux et statuts WhatsApp/Telegram pour attirer les premiers visiteurs.',
        "Vérifie que tous tes produits phares sont publiés (pas en brouillon) et bien classés dans la bonne catégorie.",
        "Ajoute de belles photos à chaque produit — les fiches avec photo se vendent toujours mieux.",
      ],
      stats,
    };
  }

  const summaryText = formatStatsForPrompt(stats);
  const raw = await deepseek.chat(
    [
      {
        role: 'system',
        content:
          "Tu aides la gérante d'une boutique en ligne de vêtements pour enfants (NANOBO) à comprendre ses ventes et à les améliorer, à partir de statistiques. Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format exact : " +
          '{"summary": "3 à 4 phrases en français, ton simple et chaleureux, qui expliquent ce qui se passe (ce qui se vend bien, ce qui stagne, la tendance) sans se contenter de répéter les chiffres", "tips": ["conseil concret et actionnable 1", "conseil concret et actionnable 2", "conseil concret et actionnable 3", "conseil concret et actionnable 4"]}. ' +
          'Les conseils doivent être précis et applicables tout de suite (ex. "remonte le prix de X qui se vend vite" plutôt que "améliore tes prix"), basés sur les données fournies — jamais génériques.',
      },
      { role: 'user', content: summaryText },
    ],
    { maxTokens: 700, temperature: 0.6 }
  );

  const parsed = extractJson(raw);
  if (parsed && typeof parsed.summary === 'string') {
    return {
      summary: parsed.summary,
      tips: Array.isArray(parsed.tips) ? parsed.tips.filter((t) => typeof t === 'string' && t.trim()) : [],
      stats,
    };
  }

  // Repli si le modèle n'a pas respecté le format JSON demandé : on garde
  // quand même le texte brut plutôt que de faire échouer la requête.
  return { summary: raw, tips: [], stats };
}

module.exports = { isConfigured, generateSalesInsight };

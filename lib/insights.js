/* =========================================================
   NANOBO — Résumé des ventes pour l'admin (via DeepSeek)
   Agrège les commandes et produits en quelques statistiques simples,
   puis demande à DeepSeek d'en tirer un résumé en langage clair pour la
   gérante de la boutique — pas juste un rappel des chiffres, mais des
   observations utiles (ce qui se vend bien, ce qui stagne...).
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

function buildStatsSummary(allOrders, allProducts, allCategories) {
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recentOrders = allOrders.filter((o) => now - new Date(o.createdAt).getTime() <= sevenDaysMs);
  const previousOrders = allOrders.filter((o) => {
    const age = now - new Date(o.createdAt).getTime();
    return age > sevenDaysMs && age <= 2 * sevenDaysMs;
  });
  const recentRevenue = recentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.total || 0), 0);

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
  const topCategories = [...revenueByCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const publishedCount = allProducts.filter((p) => p.status === 'published').length;
  const draftCount = allProducts.filter((p) => p.status === 'draft').length;
  const outOfStockCount = allProducts.filter((p) => p.status === 'published' && p.stock <= 0).length;

  const lines = [
    `Total commandes : ${totalOrders}`,
    `Chiffre d'affaires total : ${totalRevenue.toFixed(2)} MAD`,
    `Commandes des 7 derniers jours : ${recentOrders.length} (${recentRevenue.toFixed(2)} MAD)`,
    `Commandes des 7 jours précédents : ${previousOrders.length} (${previousRevenue.toFixed(2)} MAD)`,
    `Répartition par statut : ${Object.entries(byStatus).map(([s, n]) => `${s}=${n}`).join(', ') || 'aucune'}`,
    `Meilleures ventes (par quantité) : ${topSellers.map((s) => `${s.name} (${s.qty} vendus, ${s.revenue.toFixed(2)} MAD)`).join(' ; ') || 'aucune vente pour le moment'}`,
    `Chiffre d'affaires par catégorie : ${topCategories.map(([c, r]) => `${c} = ${r.toFixed(2)} MAD`).join(' ; ') || 'aucun'}`,
    `Catalogue : ${publishedCount} produits publiés, ${draftCount} brouillons, ${outOfStockCount} en rupture de stock parmi les produits publiés`,
  ];

  return lines.join('\n');
}

/**
 * Génère un résumé en langage naturel des ventes de la boutique.
 * Renvoie { insight, stats } où `stats` contient les chiffres bruts (pour
 * un affichage complémentaire éventuel côté admin) et `insight` le texte
 * généré par DeepSeek. Lève une erreur si DeepSeek n'est pas configuré ou
 * si l'appel échoue — à gérer par l'appelant (route API).
 */
async function generateSalesInsight(allOrders, allProducts, allCategories) {
  if (!allOrders.length) {
    return {
      insight:
        "Pas encore de commande enregistrée — reviens ici une fois que tu auras reçu tes premières commandes pour voir un résumé de tes ventes.",
      stats: { totalOrders: 0, totalRevenue: 0 },
    };
  }

  const summary = buildStatsSummary(allOrders, allProducts, allCategories);
  const insight = await deepseek.chat(
    [
      {
        role: 'system',
        content:
          "Tu aides la gérante d'une boutique en ligne de vêtements pour enfants (NANOBO) à comprendre ses ventes à partir de statistiques. Réponds en français, 3 à 5 phrases courtes, ton simple et chaleureux, sans jargon technique. Donne des observations concrètes et utiles (ce qui se vend bien, ce qui stagne, une suggestion si pertinent) plutôt que de juste répéter les chiffres.",
      },
      { role: 'user', content: summary },
    ],
    { maxTokens: 400, temperature: 0.6 }
  );

  return {
    insight,
    stats: {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    },
  };
}

module.exports = { isConfigured, generateSalesInsight };

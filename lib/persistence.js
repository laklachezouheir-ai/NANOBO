/* =========================================================
   NANOBO — Rendre les données de l'admin permanentes malgré le disque
   éphémère de Render (effacé à chaque déploiement).

   Sans ça, tout ce qui est ajouté/modifié depuis l'admin (ou le bot
   Telegram) — produits, catégories, commandes, personnalisation de
   l'accueil — ne survit que jusqu'au prochain déploiement du code,
   puisque Render redémarre le conteneur depuis le dépôt git à chaque
   fois. On utilise donc Cloudflare R2 (déjà configuré pour les photos)
   comme source de vérité permanente, tout en gardant une copie locale
   pour que le reste du code continue de lire le disque de façon
   synchrone (aucun changement ailleurs dans chaque magasin de données).
   ========================================================= */

const r2 = require('./r2');

/**
 * Fabrique un couple {init, persist} pour un magasin de données donné.
 *
 * - init() : à appeler une fois au démarrage du serveur, avant que quoi
 *   que ce soit ne lise les données. Si R2 est configuré, récupère la
 *   dernière version connue et écrase le fichier local avec (le fichier
 *   local, issu du dépôt git, n'est qu'une valeur de démarrage). Si R2 ne
 *   contient encore rien (tout premier démarrage), le fichier local sert
 *   d'amorce et est aussitôt envoyé sur R2.
 * - persist(data) : à appeler après chaque écriture locale, pour
 *   répercuter la donnée sur R2.
 *
 * Si R2 n'est pas configuré (développement local sans identifiants), les
 * deux fonctions ne font rien de plus : comportement fichier-local pur,
 * inchangé par rapport à avant.
 */
function makePersistent({ r2Key, readLocal, writeLocal }) {
  async function init() {
    if (!r2.isConfigured()) return;
    try {
      const remote = await r2.getJson(r2Key);
      if (remote !== null) {
        writeLocal(remote);
      } else {
        await r2.putJson(r2Key, readLocal());
      }
    } catch (err) {
      console.error(`Erreur chargement R2 (${r2Key}), utilisation des données locales :`, err.message);
    }
  }

  async function persist(data) {
    if (!r2.isConfigured()) return;
    try {
      await r2.putJson(r2Key, data);
    } catch (err) {
      console.error(`Erreur sauvegarde R2 (${r2Key}) :`, err.message);
    }
  }

  return { init, persist };
}

module.exports = { makePersistent };

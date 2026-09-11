/* =========================================================
   NANOBO — Bibliothèque d'icônes SVG inline
   (aucune dépendance externe, aucune image téléchargée :
   tout le visuel produit est généré en pictos plats colorés)
   ========================================================= */

/* ---- Icônes d'interface (traits fins, style ligne) ---- */
const UI_ICON = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.2 2.3 4.5 6 4.1c2-.2 3.8.8 6 3 2.2-2.2 4-3.2 6-3 3.7.4 5.5 4.1 4 7.6-2.5 4.6-10 9.3-10 9.3z"/></svg>`,
  heartFill: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.2 2.3 4.5 6 4.1c2-.2 3.8.8 6 3 2.2-2.2 4-3.2 6-3 3.7.4 5.5 4.1 4 7.6-2.5 4.6-10 9.3-10 9.3z"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.6L21 7H6"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.5 6.8L12 17.8 5.9 21.1l1.5-6.8-5.2-4.7 6.9-.7z"/></svg>`,
  starHalf: `<svg viewBox="0 0 24 24"><defs><linearGradient id="halfstar"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#halfstar)" stroke="currentColor" stroke-width="1" d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.5 6.8L12 17.8 5.9 21.1l1.5-6.8-5.2-4.7 6.9-.7z"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="14" height="11"/><path d="M15 10h4l3 3.5V17h-7z"/><circle cx="6" cy="19.5" r="1.8"/><circle cx="17.5" cy="19.5" r="1.8"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3.5v6c0 5-3.4 8.8-8 10.5-4.6-1.7-8-5.5-8-10.5v-6z"/><path d="M8.5 12l2.3 2.3L16 9.5"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 21v-5h5"/></svg>`,
  headset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M20 19v.5A3.5 3.5 0 0 1 16.5 23H13"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.6 2.6L16 9.6"/></svg>`,
  mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.4 7-12.5A7 7 0 0 0 5 9.5C5 14.6 12 22 12 22z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2.2 2A18 18 0 0 1 3 5.2 2 2 0 0 1 5 4z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.2 2"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 22v-8h2.7l.4-3.3H14V8.6c0-.9.3-1.6 1.7-1.6h1.8V4c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.3H8v3.3h2.5V22z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3c.4 2.2 1.9 3.7 4.2 3.9v2.7c-1.5 0-2.9-.5-4.1-1.3v6.6a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.8a2.6 2.6 0 1 0 1.9 2.5V3z"/></svg>`,
  pinterest: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.6s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.5 2 1.6 2 1.9 0 3.2-2.5 3.2-5.4 0-2.2-1.5-3.9-4.3-3.9-3.1 0-5.1 2.3-5.1 4.9 0 .9.3 1.5.7 2 .2.2.2.3.1.5l-.2.9c-.1.3-.3.4-.6.2-1.2-.5-1.8-1.9-1.8-3.4 0-2.5 2.1-5.6 6.4-5.6 3.4 0 5.7 2.5 5.7 5.1 0 3.5-1.9 6.1-4.8 6.1-1 0-1.9-.5-2.2-1.1l-.6 2.4c-.2.9-.7 2-1 2.6A10 10 0 1 0 12 2z"/></svg>`,
  arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg>`,
  creditCard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V8H5.5A2.5 2.5 0 0 1 3 5.5"/><rect x="3" y="8" width="18" height="11" rx="2"/><circle cx="16.5" cy="13.5" r="1.4"/></svg>`,
  cash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="6" y1="10" x2="6" y2="10.01"/><line x1="18" y1="14" x2="18" y2="14.01"/></svg>`,
  gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M3 13h18"/><path d="M12 9v12"/><path d="M12 9c-1-3.5-6-4.5-6-1.5C6 9 8 9 12 9zm0 0c1-3.5 6-4.5 6-1.5 0 1.5-2 1.5-6 1.5z"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.6L19 9.5l-5.2 1.9L12 17l-1.8-5.6L5 9.5l5.2-1.9z"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>`,
  sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="1.8" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="1.8" fill="currentColor" stroke="none"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l1 13H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
};

function uiIcon(name) {
  return UI_ICON[name] || "";
}

function starRow(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = '<span class="stars">';
  for (let i = 0; i < full; i++) html += uiIcon("star");
  if (half) html += uiIcon("starHalf");
  const rest = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < rest; i++) {
    html += `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.5 6.8L12 17.8 5.9 21.1l1.5-6.8-5.2-4.7 6.9-.7z"/></svg>`;
  }
  html += "</span>";
  return html;
}

/* ---- Icônes produit (illustrations plates colorées) ---- */
/* Chaque fonction reçoit une couleur primaire et une couleur secondaire
   et renvoie un pictogramme plat représentant un vêtement/accessoire. */

const PRODUCT_ICON = {
  tshirt: (p, s) => `<svg viewBox="0 0 100 100"><path d="M35 10 L50 18 L65 10 L82 22 L90 38 L76 46 L74 40 L74 90 L26 90 L26 40 L24 46 L10 38 L18 22 Z" fill="${p}"/><path d="M40 12 Q50 24 60 12" fill="none" stroke="${s}" stroke-width="4" stroke-linecap="round"/></svg>`,
  poloshirt: (p, s) => `<svg viewBox="0 0 100 100"><path d="M35 10 L50 17 L65 10 L82 22 L90 38 L76 46 L74 40 L74 90 L26 90 L26 40 L24 46 L10 38 L18 22 Z" fill="${p}"/><path d="M43 12 L43 26 L50 20 L57 26 L57 12" fill="${s}"/><circle cx="50" cy="34" r="2.2" fill="${s}"/><circle cx="50" cy="42" r="2.2" fill="${s}"/></svg>`,
  dress: (p, s) => `<svg viewBox="0 0 100 100"><path d="M38 8 L62 8 L67 22 L84 34 L73 44 L67 36 L67 90 L33 90 L33 36 L27 44 L16 34 L33 22 Z" fill="${p}"/><circle cx="50" cy="16" r="5" fill="${s}"/><path d="M33 55 Q50 62 67 55" fill="none" stroke="${s}" stroke-width="3" opacity="0.7"/></svg>`,
  skirt: (p, s) => `<svg viewBox="0 0 100 100"><path d="M32 20 H68 L86 82 H14 Z" fill="${p}"/><rect x="32" y="14" width="36" height="10" rx="5" fill="${s}"/></svg>`,
  hoodie: (p, s) => `<svg viewBox="0 0 100 100"><path d="M50 6 C36 6 28 16 28 26 L14 34 L20 48 L30 42 L30 92 L70 92 L70 42 L80 48 L86 34 L72 26 C72 16 64 6 50 6 Z" fill="${p}"/><path d="M38 24 Q50 40 62 24" fill="none" stroke="${s}" stroke-width="4"/><rect x="38" y="66" width="24" height="16" rx="4" fill="${s}" opacity="0.85"/><circle cx="46" cy="46" r="1.8" fill="${s}"/><circle cx="54" cy="46" r="1.8" fill="${s}"/></svg>`,
  jacket: (p, s) => `<svg viewBox="0 0 100 100"><path d="M40 8 L50 16 L60 8 L80 20 L88 38 L74 46 L72 40 L72 92 L28 92 L28 40 L26 46 L12 38 L20 20 Z" fill="${p}"/><path d="M50 16 L44 92 M50 16 L56 92" stroke="${s}" stroke-width="2.5" opacity="0.6"/><rect x="40" y="55" width="10" height="7" rx="1.5" fill="${s}" opacity="0.8"/><rect x="50" y="55" width="10" height="7" rx="1.5" fill="${s}" opacity="0.8"/></svg>`,
  shorts: (p, s) => `<svg viewBox="0 0 100 100"><path d="M18 14 H82 L84 48 H60 L57 86 H45 L43 52 H57 L54 48 H16 Z" fill="${p}"/><rect x="18" y="14" width="64" height="10" rx="3" fill="${s}"/></svg>`,
  jeans: (p, s) => `<svg viewBox="0 0 100 100"><path d="M22 10 H78 L82 90 H62 L58 40 L54 90 L42 90 L46 40 L42 90 H18 Z" fill="${p}"/><rect x="22" y="10" width="24" height="12" rx="2" fill="${s}" opacity="0.5"/><rect x="54" y="10" width="24" height="12" rx="2" fill="${s}" opacity="0.5"/><line x1="50" y1="24" x2="50" y2="88" stroke="${s}" stroke-width="1.5" opacity="0.5"/></svg>`,
  romper: (p, s) => `<svg viewBox="0 0 100 100"><path d="M32 8 L50 14 L68 8 L78 24 L68 30 L66 24 L66 62 Q66 88 50 90 Q34 88 34 62 L34 24 L32 30 L22 24 Z" fill="${p}"/><circle cx="50" cy="46" r="3" fill="${s}"/><circle cx="50" cy="58" r="3" fill="${s}"/><circle cx="50" cy="70" r="3" fill="${s}"/></svg>`,
  pajama: (p, s) => `<svg viewBox="0 0 100 100"><path d="M34 6 L50 12 L66 6 L76 22 L66 28 L64 22 L64 60 L70 92 H56 L52 60 H48 L44 92 H30 L36 60 L36 22 L34 28 L24 22 Z" fill="${p}"/><path d="M42 34 l4 4 M54 40 l4 4 M46 50 l4 4" stroke="${s}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  swimsuit: (p, s) => `<svg viewBox="0 0 100 100"><path d="M34 10 L50 16 L66 10 L74 26 L64 32 L64 44 Q64 90 50 92 Q36 90 36 44 L36 32 L26 26 Z" fill="${p}"/><path d="M50 16 L50 44" stroke="${s}" stroke-width="3" opacity="0.6"/></svg>`,
  sneaker: (p, s) => `<svg viewBox="0 0 100 100"><path d="M10 68 Q10 56 22 54 L40 50 L52 38 L66 40 L64 50 L86 54 Q94 56 94 68 L94 76 H10 Z" fill="${p}"/><path d="M10 68 H94" stroke="${s}" stroke-width="6"/><path d="M40 50 L52 44 M46 54 L58 47" stroke="${s}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  sandal: (p, s) => `<svg viewBox="0 0 100 100"><path d="M14 66 Q14 58 24 58 H80 Q90 58 90 66 V72 Q90 78 80 78 H24 Q14 78 14 72 Z" fill="${p}"/><path d="M30 58 Q34 40 50 40 Q66 40 70 58" fill="none" stroke="${s}" stroke-width="6" stroke-linecap="round"/></svg>`,
  cap: (p, s) => `<svg viewBox="0 0 100 100"><path d="M50 18 C30 18 16 32 14 50 H86 C84 32 70 18 50 18 Z" fill="${p}"/><path d="M14 50 H90 Q94 50 94 56 Q94 60 88 60 H14 Z" fill="${s}"/><circle cx="50" cy="20" r="3" fill="${s}"/></svg>`,
  beanie: (p, s) => `<svg viewBox="0 0 100 100"><path d="M50 14 C30 14 20 32 20 52 H80 C80 32 70 14 50 14 Z" fill="${p}"/><rect x="18" y="50" width="64" height="16" rx="6" fill="${s}"/><circle cx="50" cy="12" r="7" fill="${s}"/></svg>`,
  backpack: (p, s) => `<svg viewBox="0 0 100 100"><path d="M32 30 Q32 14 50 14 Q68 14 68 30 V34 H32 Z" fill="none" stroke="${p}" stroke-width="6"/><rect x="22" y="32" width="56" height="58" rx="12" fill="${p}"/><rect x="34" y="52" width="32" height="24" rx="6" fill="${s}"/><line x1="50" y1="32" x2="50" y2="90" stroke="${s}" stroke-width="2" opacity="0.4"/></svg>`,
  bow: (p, s) => `<svg viewBox="0 0 100 100"><path d="M46 50 L14 30 Q8 50 14 70 Z" fill="${p}"/><path d="M54 50 L86 30 Q92 50 86 70 Z" fill="${p}"/><circle cx="50" cy="50" r="12" fill="${s}"/></svg>`,
  socks: (p, s) => `<svg viewBox="0 0 100 100"><path d="M38 8 H62 V52 Q62 56 66 58 L84 68 Q90 72 88 80 Q86 90 74 90 H40 Q34 90 34 82 V58 H38 Z" fill="${p}"/><rect x="38" y="8" width="24" height="14" fill="${s}"/><rect x="34" y="56" width="28" height="6" fill="${s}" opacity="0.7"/></svg>`,
  bib: (p, s) => `<svg viewBox="0 0 100 100"><path d="M50 20 a14 14 0 0 1 28 4 v6 a28 28 0 0 1 -56 0 v-6 a14 14 0 0 1 28 -10 Z" fill="${p}"/><circle cx="50" cy="52" r="10" fill="${s}"/></svg>`,
  toy: (p, s) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="42" r="26" fill="${p}"/><circle cx="40" cy="36" r="4" fill="${s}"/><circle cx="60" cy="36" r="4" fill="${s}"/><path d="M38 50 Q50 58 62 50" fill="none" stroke="${s}" stroke-width="3" stroke-linecap="round"/><rect x="42" y="68" width="16" height="20" rx="6" fill="${p}"/></svg>`,
};

function productIcon(key, primary, secondary) {
  const fn = PRODUCT_ICON[key] || PRODUCT_ICON.tshirt;
  return fn(primary, secondary || "#ffffff");
}

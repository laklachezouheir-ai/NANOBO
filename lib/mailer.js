/* =========================================================
   NANOBO — Envoi d'e-mails transactionnels via Resend (resend.com)
   Utilise directement l'API HTTP de Resend (fetch), sans SDK.
   ========================================================= */

const { getResendConfig } = require('./config');

function isConfigured() {
  return Boolean(getResendConfig());
}

function formatPrice(n) {
  return Number(n || 0).toFixed(2).replace('.', ',') + ' MAD';
}

function orderConfirmationHtml(order) {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0e6dd;">
          <strong style="color:#2b2b3d;font-size:14px;">${item.name}</strong><br>
          <span style="color:#8a8aa0;font-size:12px;">${[item.color, item.size].filter(Boolean).join(' · ')} · Qté ${item.qty}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #f0e6dd;text-align:right;color:#2b2b3d;font-size:14px;font-weight:600;white-space:nowrap;">
          ${formatPrice(item.price * item.qty)}
        </td>
      </tr>`
    )
    .join('');

  return `
  <div style="background:#fff9f3;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 14px rgba(43,43,61,0.06);">
      <div style="background:#2b2b3d;padding:28px 32px;text-align:center;">
        <span style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#ffffff;">Nano<span style="color:#ff6b7a;">bo</span></span>
      </div>
      <div style="padding:32px;">
        <h1 style="font-size:20px;color:#2b2b3d;margin:0 0 8px;">Merci pour votre commande, ${order.customer.firstName} !</h1>
        <p style="color:#4a4a5e;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Nous avons bien reçu votre commande <strong>#${order.orderNumber}</strong>. Voici son récapitulatif :
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${itemsRows}
        </table>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#4a4a5e;font-size:13px;">Sous-total</td>
            <td style="padding:4px 0;text-align:right;color:#4a4a5e;font-size:13px;">${formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#4a4a5e;font-size:13px;">Livraison</td>
            <td style="padding:4px 0;text-align:right;color:#4a4a5e;font-size:13px;">${order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Offerte'}</td>
          </tr>
          <tr>
            <td style="padding:10px 0 0;color:#2b2b3d;font-size:15px;font-weight:700;border-top:2px solid #f0e6dd;">Total</td>
            <td style="padding:10px 0 0;text-align:right;color:#2b2b3d;font-size:15px;font-weight:700;border-top:2px solid #f0e6dd;">${formatPrice(order.total)}</td>
          </tr>
        </table>

        <div style="background:#fff9f3;border-radius:14px;padding:18px 20px;margin-top:24px;">
          <strong style="display:block;color:#2b2b3d;font-size:13px;margin-bottom:6px;">Adresse de livraison</strong>
          <span style="color:#4a4a5e;font-size:13px;line-height:1.6;">
            ${order.customer.firstName} ${order.customer.lastName}<br>
            ${order.shipping.address}<br>
            ${order.shipping.postalCode} ${order.shipping.city}, ${order.shipping.country}
          </span>
        </div>

        <p style="color:#8a8aa0;font-size:12px;line-height:1.6;margin-top:24px;">
          Boutique de démonstration NANOBO — cet e-mail confirme l'enregistrement de votre commande dans notre système, sans paiement réel effectué.
        </p>
      </div>
    </div>
  </div>`;
}

async function sendOrderConfirmation(order) {
  const config = getResendConfig();
  if (!config) {
    const err = new Error("Resend n'est pas configuré (RESEND_API_KEY manquante).");
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to: [order.customer.email],
      subject: `Confirmation de votre commande #${order.orderNumber} — NANOBO`,
      html: orderConfirmationHtml(order),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Échec de l'envoi via Resend (${res.status}) : ${body.slice(0, 300)}`);
    err.code = 'MAIL_SEND_FAILED';
    throw err;
  }

  return res.json();
}

module.exports = { isConfigured, sendOrderConfirmation };

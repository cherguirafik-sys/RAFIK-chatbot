// ============================================================
//  whatsapp.js — Envoyer un message WhatsApp (API officielle Meta)
// ============================================================

const GRAPH_URL = "https://graph.facebook.com/v21.0";

/**
 * Envoie un message texte à un client WhatsApp.
 * @param {string} numero - numéro du destinataire (format international, sans +)
 * @param {string} texte  - le message à envoyer
 */
export async function envoyerMessage(numero, texte) {
  const url = `${GRAPH_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: numero,
      type: "text",
      text: { body: texte.slice(0, 4096) }, // WhatsApp limite à 4096 caractères
    }),
  });

  if (!res.ok) {
    console.error("❌ Erreur d'envoi WhatsApp :", res.status, await res.text());
  }
}

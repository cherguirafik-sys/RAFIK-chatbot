// ============================================================
//  server.js — Le "pont" entre WhatsApp et Claude
// ============================================================
// Fonctionnement :
//  1. Un client écrit sur WhatsApp à votre numéro professionnel.
//  2. Meta (WhatsApp) envoie ce message à notre serveur, sur /webhook.
//  3. On demande une réponse à Claude (claude.js).
//  4. On renvoie la réponse au client sur WhatsApp (whatsapp.js).

import crypto from "node:crypto";
import express from "express";
import { repondre } from "./claude.js";
import { envoyerMessage } from "./whatsapp.js";

const app = express();
const PORT = process.env.PORT || 3000;

// On garde le corps brut de la requête pour vérifier la signature de Meta
app.use(express.json({ verify: (req, _res, buf) => (req.rawBody = buf) }));

// ---- Page d'accueil : pour vérifier que le serveur tourne ----
app.get("/", (_req, res) => res.send("✅ Assistant WhatsApp de Rafik en ligne"));

// ---- Étape A : Meta vérifie que le webhook nous appartient ----
// Lors de la configuration, Meta appelle cette adresse avec un "code secret"
// (verify token). Si c'est le bon, on répond avec le "challenge".
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook vérifié par Meta");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ---- Sécurité : vérifier que le message vient bien de Meta ----
function signatureValide(req) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true; // vérification désactivée si pas de secret configuré
  const signature = req.get("x-hub-signature-256") || "";
  const attendu =
    "sha256=" + crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  return (
    signature.length === attendu.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(attendu))
  );
}

// Meta renvoie parfois le même message deux fois : on évite de répondre en double
const dejaTraites = new Set();

// ---- Étape B : réception des messages des clients ----
app.post("/webhook", (req, res) => {
  if (!signatureValide(req)) {
    console.warn("⚠️ Signature invalide : requête ignorée");
    return res.sendStatus(401);
  }

  // On répond tout de suite "OK" à Meta (sinon Meta renvoie le message)
  res.sendStatus(200);

  const value = req.body?.entry?.[0]?.changes?.[0]?.value;
  const messages = value?.messages || [];
  for (const message of messages) {
    traiterMessage(message).catch((err) =>
      console.error("❌ Erreur pendant le traitement :", err)
    );
  }
});

async function traiterMessage(message) {
  if (dejaTraites.has(message.id)) return;
  dejaTraites.add(message.id);
  if (dejaTraites.size > 1000) dejaTraites.clear();

  const numero = message.from; // numéro du client

  // Pour l'instant, l'assistant ne comprend que les messages texte
  if (message.type !== "text") {
    await envoyerMessage(
      numero,
      "Merci ! Pour l'instant je ne lis que les messages écrits. Pouvez-vous m'écrire votre demande ? 🙂"
    );
    return;
  }

  const texte = message.text.body;
  console.log(`📩 ${numero} : ${texte}`);

  const reponse = await repondre(numero, texte);
  console.log(`🤖 → ${numero} : ${reponse}`);

  await envoyerMessage(numero, reponse);
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

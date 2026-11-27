// ============================================================
//  claude.js — Parler à Claude et se souvenir des conversations
// ============================================================
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt.js";

// Le client lit automatiquement la clé ANTHROPIC_API_KEY du fichier .env
const client = new Anthropic();

// Modèle utilisé (modifiable dans .env avec CLAUDE_MODEL)
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

// ---- Mémoire des conversations -------------------------------
// Pour chaque numéro de téléphone, on garde les derniers messages,
// pour que Claude se souvienne de ce que le client a déjà dit.
// ⚠️ Cette mémoire est effacée si le serveur redémarre (c'est
// suffisant pour démarrer ; plus tard on pourra utiliser une base de données).
const conversations = new Map();
const MAX_MESSAGES = 20; // on garde les 20 derniers messages
const OUBLI_APRES_MS = 24 * 60 * 60 * 1000; // conversation oubliée après 24 h

function getHistorique(numero) {
  const conv = conversations.get(numero);
  if (!conv || Date.now() - conv.derniereActivite > OUBLI_APRES_MS) {
    const nouvelle = { messages: [], derniereActivite: Date.now() };
    conversations.set(numero, nouvelle);
    return nouvelle;
  }
  return conv;
}

/**
 * Envoie le message du client à Claude et renvoie la réponse (texte).
 * @param {string} numero - le numéro WhatsApp du client (sert d'identifiant)
 * @param {string} texte  - ce que le client a écrit
 */
export async function repondre(numero, texte) {
  const conv = getHistorique(numero);
  conv.messages.push({ role: "user", content: texte });

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: conv.messages,
    // "low" = réponses rapides et économiques, idéal pour un chat
    output_config: { effort: "low" },
    // Si Claude refuse une demande, l'API réessaie automatiquement
    // avec un autre modèle au lieu de laisser le client sans réponse.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  // On récupère uniquement le texte de la réponse
  let reponse = response.content
    .filter((bloc) => bloc.type === "text")
    .map((bloc) => bloc.text)
    .join("\n")
    .trim();

  if (!reponse || response.stop_reason === "refusal") {
    reponse =
      "Merci pour votre message ! Rafik va revenir vers vous personnellement très vite. 🏠";
  }

  // On garde la réponse dans l'historique, puis on limite la taille
  conv.messages.push({ role: "assistant", content: reponse });
  conv.derniereActivite = Date.now();
  if (conv.messages.length > MAX_MESSAGES) {
    conv.messages = conv.messages.slice(-MAX_MESSAGES);
    // l'historique doit toujours commencer par un message du client
    while (conv.messages[0]?.role !== "user") conv.messages.shift();
  }

  return reponse;
}

// ============================================================
//  test-chat.js — Discuter avec l'assistant dans le terminal
// ============================================================
// Permet de tester les réponses de Claude SANS WhatsApp.
// Lancez :  npm run chat    (tapez "quitter" pour sortir)

import readline from "node:readline/promises";
import { repondre } from "./claude.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log("💬 Écrivez comme un client WhatsApp (tapez 'quitter' pour sortir)\n");

while (true) {
  const texte = await rl.question("Vous : ");
  if (texte.trim().toLowerCase() === "quitter") break;
  if (!texte.trim()) continue;
  const reponse = await repondre("test-local", texte);
  console.log(`\nAssistant : ${reponse}\n`);
}
rl.close();

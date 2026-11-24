# CLAUDE.md — Règles du projet Rafik

Ce fichier est lu automatiquement par Claude Code à chaque session.
Il contient les règles à respecter pour ce projet.

## Le projet

- **Rafik — Agent Immobilier** (Loire & Rhône-Alpes, réseau Les Porteclés :
  Saint-Étienne, Lyon, Villefranche, Cruas).
- Chatbot web : `index.html`.
- L'utilisateur est **débutant** : expliquer simplement, en français, étape par étape.

## Charte de marque (à réutiliser partout, y compris dans les vidéos)

| Élément        | Valeur                                         |
|----------------|------------------------------------------------|
| Rouge principal | `#e63946` (dégradé vers `#c1121f`)            |
| Bleu nuit       | `#1a1a2e` (dégradé vers `#0f3460`)            |
| Fond clair      | `#ffffff` / `#fafafa`                         |
| Police          | Segoe UI (sinon une sans-serif équivalente)   |
| Logo            | Avatar rond rouge avec l'emoji 🏠             |
| Signature       | « Rafik – Agent Immobilier · Les Porteclés »  |

## Création de vidéos — le système

Claude Code ne filme rien : il écrit du code (Remotion ou HyperFrames) qui
transforme un script, la marque et des fichiers en MP4.

### Le workflow vidéo (toujours dans cet ordre)

1. **Brief** — objectif, public, format, durée, script, couleurs, logo, appel à l'action.
2. **Plan** — lister chaque scène (timing, visuels, texte, transitions).
   **Attendre l'accord de l'utilisateur avant d'écrire le code.**
3. **Construction** — une scène à la fois ; montrer une image fixe de la scène, puis attendre.
4. **Voix** — synchroniser chaque scène sur la phrase de la voix off qui lui correspond.
5. **Sous-titres** — calés au mot, mots-clés mis en avant, marges de sécurité.
6. **Vérification** — exporter une image fixe par scène et repérer :
   chevauchements, textes coupés, couleurs illisibles. Corriger avant de continuer.
7. **Rendu** — MP4 final, puis FFmpeg pour compression, volume sonore,
   déclinaisons de format (9:16, 1:1, 16:9) et miniatures.
8. **Modèle** — enregistrer ce qui a marché (scènes, réglages) pour la prochaine vidéo.
9. **Et on recommence.**

### Règles strictes

- **Ne jamais inventer** de faits, de chiffres (prix, surfaces, statistiques)
  ni d'affirmations. Si une info manque, la demander.
- Ne jamais faire « toute la vidéo d'un coup » : **une scène à la fois**.
- Musique : uniquement sous licence ou libre de droits.

### Garder le contrôle — checklist avant publication

- [ ] **Faits** vérifiés (adresses, prix, surfaces, disponibilités)
- [ ] **Affirmations** justifiables (pas de promesse non tenable)
- [ ] **Droits musicaux** OK
- [ ] **Usage de la marque** conforme (Les Porteclés, logos)
- [ ] **Sous-titres** relus (orthographe, synchro)

## Le prompt maître

Le prompt complet, prêt à copier-coller, est dans
[`prompts/video-prompt-maitre.md`](prompts/video-prompt-maitre.md).

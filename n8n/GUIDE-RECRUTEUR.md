# 🛵 Nora : agent IA recruteur pour l'app de livraison

Nora discute avec les candidats (**livreurs**, **restaurants partenaires**, **développeurs**).
Elle enregistre chaque candidature complète dans **Google Sheets**.
**Chaque soir à 19h**, tu reçois par email une **synthèse du jour** rédigée par l'IA.

## Comment ça marche ?

```
recruteur.html  ──message──▶  N8N (webhook)  ──▶  IA (OpenAI)  ──▶  réponse affichée + lue à voix haute
                                                      │
                                         candidature complète ?
                                                      ▼
                                                Google Sheets
                                                      │
                     chaque soir à 19h  ──▶  IA rédige la synthèse  ──▶  Gmail 📧
```

## Installation en 5 étapes

### 1. Créer le Google Sheet
1. Crée un nouveau Google Sheet et renomme l'onglet du bas en **`Candidats`**.
2. Sur la ligne 1, écris exactement ces titres de colonnes, de A à L :

   `Date | Heure | Type | Nom | Téléphone | Email | Ville | Détails | Disponibilités | Score | Résumé | Session`

3. Copie l'adresse (URL) du Sheet.

### 2. Importer le workflow dans N8N
1. Dans N8N, clique sur **Workflows → Add workflow**.
2. Ouvre le menu **⋯ → Import from File** et choisis `n8n/recruteur-livraison.json`.

### 3. Brancher tes comptes (credentials)
Ouvre chaque nœud qui affiche ⚠️ et choisis ou crée le compte correspondant :

| Nœud | Compte à brancher |
|---|---|
| **IA Nora** et **IA Synthèse** | OpenAI (ta clé API) |
| **Enregistrer le candidat** et **Lire tous les candidats** | Google Sheets. Colle l'URL de ton Sheet à la place de `COLLER_ICI_L_URL_DE_VOTRE_GOOGLE_SHEET` |
| **Envoyer la synthèse** | Gmail. Remplace `VOTRE_EMAIL@exemple.com` par ton adresse |

### 4. Activer
Enregistre le workflow, puis active l'interrupteur **Active** en haut à droite.

### 5. Mettre la bonne URL dans la page
Dans `recruteur.html`, vérifie la ligne :
```js
var WEBHOOK = "https://n8n.srv1360323.hstgr.cloud/webhook/recruteur-livraison";
```
Elle doit correspondre à l'**URL de production** affichée dans le nœud **Webhook Recruteur**.

## Tester
- **Le chat** : ouvre `recruteur.html` dans Chrome, clique sur « 🛵 Devenir livreur » et réponds aux questions. Quand la candidature est complète, une nouvelle ligne apparaît dans le Sheet.
- **La synthèse** : dans N8N, clique sur le nœud **Chaque soir à 19h**, puis sur **Execute step**. Tu reçois l'email tout de suite, sans attendre 19h.

## Personnaliser (facile)
- **Changer l'heure de la synthèse** : dans le nœud *Chaque soir à 19h*, l'expression `0 19 * * *` signifie « à la minute 0, à 19h, tous les jours ». Pour 8h du matin, mets `0 8 * * *`.
- **Changer les questions de Nora** : modifie le texte `SYSTEM` dans le nœud *Préparer la conversation*.
- **Changer le contenu du rapport** : modifie le texte `PROMPT` dans le nœud *Candidats du jour*.

## Bon à savoir
- La voix (micro) utilise la reconnaissance vocale gratuite du navigateur. Elle marche sur **Chrome** et **Edge**. Sur les autres navigateurs, le candidat peut écrire.
- Le modèle `gpt-4o-mini` coûte très peu cher, quelques centimes pour des centaines de messages.
- Les candidats donnent des données personnelles (téléphone, email). Garde le Google Sheet **privé** pour respecter le RGPD.

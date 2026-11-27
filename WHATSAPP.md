# 📱 Assistant WhatsApp de Rafik — Guide pas à pas

Ce projet branche **Claude** (l'IA d'Anthropic) sur **votre numéro WhatsApp professionnel**.
Quand un client vous écrit, l'assistant lui répond automatiquement, 24h/24.

```
Client WhatsApp → Meta (WhatsApp) → votre serveur (server.js) → Claude → réponse au client
```

## 🗂️ Les fichiers

| Fichier | À quoi il sert |
|---|---|
| `prompt.js` | **La personnalité de l'assistant.** C'est le fichier que vous modifierez le plus : vos règles, vos horaires, vos biens. |
| `server.js` | Le "pont" : reçoit les messages WhatsApp et renvoie les réponses. |
| `claude.js` | Demande la réponse à Claude et garde la mémoire de chaque conversation. |
| `whatsapp.js` | Envoie un message au client via l'API officielle de WhatsApp. |
| `test-chat.js` | Pour tester l'assistant dans le terminal, sans WhatsApp. |
| `.env.example` | Modèle du fichier de clés secrètes. |

---

## Étape 1 — Obtenir une clé Claude (≈ 5 min)

1. Allez sur https://console.anthropic.com et créez un compte.
2. Ajoutez un moyen de paiement (Billing). Vous payez à l'usage, quelques centimes par conversation.
3. Menu **API Keys** → **Create Key** → copiez la clé (`sk-ant-...`).

## Étape 2 — Tester l'assistant sur votre ordinateur (≈ 5 min)

Il faut avoir installé [Node.js](https://nodejs.org) (version 20 ou plus).

```bash
npm install                 # installe les outils
cp .env.example .env        # crée votre fichier de clés
# ouvrez .env et collez votre clé dans ANTHROPIC_API_KEY
npm run chat                # discutez avec l'assistant !
```

Écrivez par exemple « Bonjour, je cherche un T3 à Saint-Étienne ». Si les réponses ne vous plaisent pas, modifiez `prompt.js` puis relancez le test.

## Étape 3 — Obtenir le numéro WhatsApp chez Meta (≈ 30 min)

1. Créez un compte **Meta Business** : https://business.facebook.com
2. Allez sur https://developers.facebook.com → **Mes apps** → **Créer une app** → type **Business**.
3. Dans l'app, ajoutez le produit **WhatsApp** → **API Setup**.
4. Meta vous donne un **numéro de test gratuit**. C'est parfait pour commencer.
   Notez :
   - le **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - le **Access token** → `WHATSAPP_TOKEN`
5. Dans la même page, ajoutez votre propre téléphone comme destinataire de test.
6. Plus tard, cliquez sur **Add phone number** pour ajouter **votre vrai numéro professionnel**.
   ⚠️ Ce numéro ne doit **pas** être déjà utilisé dans l'application WhatsApp normale. Prenez une nouvelle SIM ou un numéro dédié.

> ℹ️ Le jeton de test expire après 24 h. Pour la mise en production, créez un **jeton permanent**
> (Business Settings → Utilisateurs système → Générer un jeton, avec la permission `whatsapp_business_messaging`).

## Étape 4 — Mettre le serveur en ligne

Meta doit pouvoir joindre votre serveur sur Internet, en **https**.

- **Pour tester depuis votre ordinateur :** lancez `npm start`, puis dans un autre terminal
  `npx ngrok http 3000`. Ngrok vous donne une adresse du type `https://xxxx.ngrok-free.app`.
- **Pour la production :** hébergez le projet sur Render, Railway ou un petit serveur VPS
  (Hostinger, par exemple). Commande de démarrage : `npm start`. Recopiez-y les variables de votre fichier `.env`.

## Étape 5 — Relier Meta à votre serveur (le "webhook")

1. Dans votre app Meta → **WhatsApp** → **Configuration** → **Webhook** → **Modifier** :
   - **URL de rappel :** `https://VOTRE-ADRESSE/webhook`
   - **Jeton de vérification :** la même valeur que `WHATSAPP_VERIFY_TOKEN` dans votre `.env`
2. Cliquez sur **Vérifier et enregistrer**. Votre terminal doit afficher `✅ Webhook vérifié par Meta`.
3. Dans **Champs du webhook**, abonnez-vous à **messages**.
4. Envoyez un message WhatsApp au numéro : l'assistant répond ! 🎉

---

## ⚖️ Règles WhatsApp à respecter

- **Fenêtre de 24 h :** vous pouvez répondre librement pendant 24 h après le dernier message du client.
  Pour relancer un client après ce délai, il faut un **message modèle** validé par Meta.
- **Transparence :** l'assistant annonce qu'il est un assistant automatique. C'est déjà prévu dans `prompt.js`.
- **Données personnelles (RGPD) :** mentionnez dans vos conditions que les messages sont traités par un assistant IA.

## 🔜 Améliorations possibles

- Ajouter la liste de vos biens dans `prompt.js` pour que l'assistant puisse les présenter.
- Recevoir un e-mail ou une notification quand un client veut un rendez-vous.
- Comprendre les messages vocaux et les photos.
- Garder la mémoire des conversations dans une base de données, pour qu'elle survive aux redémarrages du serveur.

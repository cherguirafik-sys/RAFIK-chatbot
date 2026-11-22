# Business plan : [Nom de ta société]

*Plateforme locale de livraison de repas (restaurants, snacks, fast-foods) où le client commande **directement dans WhatsApp**, sans télécharger d'application et sans passer par Uber Eats ou Deliveroo.*

> 📝 **[Nom de ta société]** est à remplacer par ton futur nom de marque.
> ⚠️ **Daba (trydaba.com) est un concurrent**, analysé dans `03-analyse-concurrent-daba.md`.
>
> Les chiffres sont des **hypothèses d'exemple** à adapter. Les **tarifs et règles de Meta changent souvent** : vérifie-les avant de lancer.

---

## 1. Résumé

| Élément | Contenu |
|---|---|
| **Le problème** | Uber Eats et Deliveroo prennent environ 25 à 35 % de commission. Les clients ne veulent plus installer une application de plus. |
| **La solution** | Une **place de marché locale sur WhatsApp** : tous les snacks du quartier sur **un seul numéro**, avec **tes propres livreurs**. Le restaurant paie un montant fixe. |
| **Pourquoi WhatsApp** | Pas de téléchargement, conversion plus facile, développement moins cher, et un canal direct pour fidéliser |
| **Ce qu'on gagne** | **1 € de marge opérationnelle par commande** |
| **Objectif à 3 ans** | 3 villes, 250 restaurants, environ 3 000 commandes par jour |

---

## 2. La concurrence et ton positionnement

| | Uber Eats / Deliveroo | Daba (trydaba.com) | **[Nom de ta société]** |
|---|---|---|---|
| Modèle | Place de marché + application | Logiciel vendu à chaque restaurant (agent IA WhatsApp) | **Place de marché WhatsApp de quartier** |
| Commission restaurant | 25 à 35 % | 0 %, prix par commande sur devis | **1,50 € fixe, affiché** |
| Découverte de restaurants | ✅ | ❌ (un numéro par restaurant) | ✅ (un numéro pour tous) |
| Livreurs | Les leurs | Uber Direct (sous-traité) | **Ta flotte locale** |
| Zones | Grandes villes | Là où Uber Direct est disponible | **Villes moyennes et quartiers mal desservis** |

**Ton positionnement :** « Tous les snacks de ta ville sur un seul WhatsApp, livrés par des livreurs du coin. »

👉 **L'argument de vente :** un snack qui fait 300 commandes par mois économise environ **6 € × 300 = 1 800 € par mois** par rapport à Uber Eats.

---

## 3. Comment ça marche

### Le parcours du client (dans WhatsApp)

```
1. Il scanne un QR code ou clique sur un lien wa.me
2. « Bonjour 👋 Dans quel restaurant veux-tu commander ? »  → liste à choisir
3. Le menu s'affiche (catalogue avec photos et prix)  → il remplit son panier
4. « Partage ton adresse 📍 »  → il envoie sa localisation
5. Récapitulatif + lien de paiement sécurisé (carte, Apple Pay, Google Pay)
6. ✅ « Commande confirmée ! »
7. 🛵 « Ton livreur arrive dans 10 min »
8. ⭐ Avis + bouton « Recommander »
```

### Les 3 acteurs

| Acteur | Ce qu'il utilise |
|---|---|
| **Client** | WhatsApp uniquement |
| **Restaurant** | Une alerte WhatsApp avec boutons « Accepter / Refuser », et une page web sur tablette pour son menu et ses ventes |
| **Livreur** | Les courses par WhatsApp (adresse, lien GPS, bouton « Livré ») ou une page web simple |

---

## 4. L'expertise technique WhatsApp

### 4.1 Utiliser l'API, pas l'appli du téléphone

| | Appli WhatsApp Business | **API WhatsApp Business (Cloud API de Meta)** ✅ |
|---|---|---|
| Robot automatique | ❌ | ✅ |
| Plusieurs restaurants sur un même numéro | ❌ | ✅ |
| Connexion au paiement et à ta base de données | ❌ | ✅ |
| Usage idéal | Test à la main (phase 0) | **Le vrai produit** |

### 4.2 Les démarches

1. Créer un **compte Meta Business** (business.facebook.com).
2. Faire la **vérification de l'entreprise** (Kbis) : il faut donc créer la société avant.
3. Prendre un **numéro dédié**, pas encore utilisé sur WhatsApp.
4. Faire valider le **nom affiché**.
5. Se connecter à l'API **en direct** (gratuit, avec un développeur) ou **via un prestataire officiel (BSP)** comme 360dialog, Twilio ou Vonage.

### 4.3 Les outils WhatsApp

| Outil | À quoi il sert |
|---|---|
| Messages « liste » | Choisir le restaurant ou la catégorie (jusqu'à 10 choix) |
| Boutons de réponse | Ajouter, Valider, Annuler (jusqu'à 3 boutons) |
| Catalogue produits | Le menu avec photos, prix et panier |
| WhatsApp Flows | Les formulaires : options, adresse, créneau |
| Partage de localisation | L'adresse exacte du client |
| Modèles de messages | Les messages que tu envoies en premier (validés par Meta) |
| Publicités « Clic vers WhatsApp » | Des pubs Instagram ou Facebook qui ouvrent la conversation |

⚠️ **WhatsApp Pay n'existe pas en France**, il faut donc envoyer un **lien de paiement Stripe**.

### 4.4 Les règles Meta

- **Fenêtre de 24 h** pour répondre librement. Passé ce délai, uniquement des modèles validés.
- **Consentement (opt-in) obligatoire** avant tout message promotionnel.
- **Note de qualité** : trop de blocages entraînent des limites d'envoi, voire la suspension du numéro.
- **Limites d'envoi** qui augmentent progressivement.
- **Robot dédié à la commande** : autorisé. Les IA « généralistes » sont interdites.
- **Politique commerce** : la nourriture est autorisée, l'alcool est à éviter.

### 4.5 Un seul numéro, un lien par restaurant

Chaque restaurant reçoit son QR code, par exemple `wa.me/33XXXXXXXXX?text=SNACK-ALI`. Le robot ouvre directement son menu.

### 4.6 L'architecture

```
Client WhatsApp ⇄ API Cloud Meta ⇄ [ Ton serveur ] ⇄ Base de données
                                        ⇅              ⇅
                                 Stripe (paiement)   Page web restaurant / livreur
```

| Brique | Débutant (sans code) | Pro |
|---|---|---|
| Robot | n8n / Make | Node.js / Python |
| Données | Airtable / Google Sheets | PostgreSQL / Supabase |
| Paiement | Stripe Payment Links | Stripe Connect |
| Interface restaurant | Glide / Softr | Application web sur mesure |

---

## 5. Le modèle économique : 1 € par commande

| Ligne (panier moyen de 25 €) | Montant |
|---|---|
| Frais de livraison payés par le client | + 3,49 € |
| Frais fixe payé par le restaurant | + 1,50 € |
| **= Revenu** | **4,99 €** |
| Rémunération du livreur | − 3,40 € |
| Frais de paiement Stripe (≈ 1,5 % + 0,25 €) | − 0,59 € |
| Messages WhatsApp liés à la commande | ≈ 0,00 € * |
| **= Marge opérationnelle** | **✅ 1,00 €** |

\* Gratuits quand le client écrit en premier (fenêtre de 24 h), selon la grille Meta en vigueur depuis juillet 2025. Les messages marketing sont payants et comptés dans le budget marketing. Vérifie la grille à jour.

**Les revenus en plus :** un abonnement Premium pour les restaurants (≈ 29 €/mois), et un mode « logiciel seul » pour les restaurants qui ont leurs propres livreurs. Ce mode répond directement à Daba.

---

## 6. Les prévisions sur 3 ans

| | Année 1 | Année 2 | Année 3 |
|---|---|---|---|
| Restaurants actifs (en moyenne) | 30 | 100 | 250 |
| Commandes / jour / restaurant | 8 | 10 | 12 |
| **Commandes par an** | 87 600 | 365 000 | 1 095 000 |
| **Marge (× 1 €)** | **87 600 €** | **365 000 €** | **1 095 000 €** |

| Charges fixes | Année 1 | Année 2 | Année 3 |
|---|---|---|---|
| Salaires + charges | 48 000 € | 150 000 € | 400 000 € |
| Technique | 4 000 € | 10 000 € | 30 000 € |
| Marketing | 20 000 € | 60 000 € | 180 000 € |
| Comptable, juridique, assurances | 6 000 € | 15 000 € | 35 000 € |
| Locaux et divers | 4 000 € | 12 000 € | 30 000 € |
| Amortissement du développement (15 000 € sur 3 ans) | 5 000 € | 5 000 € | 5 000 € |
| **Total** | **87 000 €** | **252 000 €** | **680 000 €** |

| | Année 1 | Année 2 | Année 3 |
|---|---|---|---|
| **Résultat avant impôts** | **≈ 0 €** 🟡 | **+ 113 000 €** 🟢 | **+ 415 000 €** 🟢 |

**Point mort de l'année 1 :** 87 000 commandes, soit environ **240 commandes par jour**.

| Sensibilité | Année 2 | Année 3 |
|---|---|---|
| 0,80 € / commande | + 40 000 € | + 196 000 € |
| **1,00 €** | **+ 113 000 €** | **+ 415 000 €** |
| 1,20 € | + 186 000 € | + 634 000 € |

---

## 7. Le financement de départ

| Besoin | Montant | Ressource | Montant |
|---|---|---|---|
| Développement | 15 000 € | Apport personnel | 10 000 € |
| Création + juridique | 5 000 € | Prêt d'honneur (Initiative France, Réseau Entreprendre) | 15 000 € |
| Lancement marketing | 15 000 € | Banque / BPI | 25 000 € |
| Trésorerie | 15 000 € | | |
| **Total** | **50 000 €** | **Total** | **50 000 €** |

Pense aussi à l'**ACRE** et à l'**ARCE** (France Travail).

---

## 8. Le cadre juridique

| Sujet | Ce qu'il faut faire |
|---|---|
| Statut | SAS ou SASU |
| Livreurs | Auto-entrepreneurs ⚠️ La directive européenne 2024/2831 sur le travail via plateformes crée une présomption de salariat : avocat obligatoire. Alternatives : coopérative, ou livreurs du restaurant. |
| RGPD | Politique de confidentialité, registre des traitements, consentement pour le marketing |
| CGV / CGU | Obligatoires, avec un **médiateur de la consommation** |
| Allergènes | Les 14 allergènes affichés **avant l'achat** |
| Hygiène | Sacs isothermes, délais de livraison courts |
| Argent | Stripe Connect (encaissement pour le compte des restaurants) |
| TVA | 20 % sur tes frais de service et commissions ; ton comptable vérifiera les frais de livraison |
| Assurances | Responsabilité civile professionnelle ; vérifier celle des livreurs |
| Nom de marque | Vérifier la disponibilité à l'**INPI** et du nom de domaine, sans ressemblance avec « Daba » |

---

## 9. Le plan de lancement

| Phase | Durée | Objectif | Comment |
|---|---|---|---|
| 0. Test à la main | Mois 1-2 | Prouver la demande | 3 à 5 restaurants, WhatsApp Business classique + Google Sheets |
| 1. MVP | Mois 3-4 | Automatiser | API Cloud + n8n + Airtable + liens Stripe |
| 2. Produit solide | Mois 5-12 | 200 à 300 commandes par jour | Serveur, Stripe Connect, interfaces |
| 3. Expansion | Années 2-3 | Nouvelles villes | Reproduire la méthode qui marche |

**Trouver des clients :** démarchage en personne avec le calcul des économies, QR codes partout, pubs « Clic vers WhatsApp », TikTok et Snapchat, parrainage, bouton « Recommander ».

---

## 10. Les risques

| Risque | Solution |
|---|---|
| Dépendance à Meta | Respect des règles, ta propre base clients, un numéro de secours, une page web de commande en plan B |
| **Daba ajoute une place de marché ou ses propres livreurs** | Aller vite sur ton territoire, nouer une relation locale forte, garder des prix simples |
| Peu de commandes au début | Une seule zone dense, et des restaurants qui amènent leurs clients |
| Manque de livreurs | Bonus aux heures de pointe, mode « livreurs du restaurant » |
| Requalification des livreurs | Avocat, contrats clairs |
| Marge trop faible | Premium, frais de livraison selon la distance |

---

## 11. Les indicateurs à suivre chaque semaine

Commandes par jour (point mort ≈ 240) · marge réelle par commande · conversion conversations → commandes · réachat à 30 jours · temps de livraison · coût d'acquisition d'un client · note de qualité WhatsApp.

---

## 12. Tes 5 actions cette semaine

1. Démarcher 5 restaurants près de chez toi, avec le calcul « 1 800 € économisés par mois ».
2. Choisir ton nom de marque et créer ta SAS, puis ton compte Meta Business.
3. Tester à la main avec WhatsApp Business.
4. Ouvrir ton compte Stripe.
5. Prendre rendez-vous pour le prêt d'honneur, avec un comptable et avec un avocat.

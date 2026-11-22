# Projections en autofinancement : modèle « logiciel WhatsApp à 1 € par commande »

> **Nouveau modèle :** tu vends ton outil de commande WhatsApp aux restaurants, avec ton accompagnement, pour **1 € HT par commande**. Tu ne gères **pas** de livreurs : le restaurant livre lui-même ou propose le retrait sur place.
> **Sans prêt ni levée de fonds :** tout est payé avec ton argent puis avec les revenus.
> Ce sont des hypothèses d'exemple, à mettre à jour avec tes vrais chiffres.

---

## 1. L'offre du développeur à 3 000 €

### Ce qui est intéressant ✅
- **Le prix** : un freelance français demanderait plutôt 10 000 à 20 000 € pour le même travail. 3 000 €, c'est ce que tu peux financer seul.
- **L'assistance « à vie »** : sur le papier, c'est un vrai plus.

### Ce qui est risqué ⚠️
| Risque | Pourquoi |
|---|---|
| « À vie », sans contrat | Une promesse orale ne t'engage à rien. Si le développeur disparaît, tu te retrouves sans support. |
| Propriété du code | Si le code reste sur **ses** serveurs, l'application ne t'appartient pas vraiment |
| Qualité et sécurité | Paiements et données clients : un bug peut coûter cher (fraude, plainte, suspension par Meta) |
| RGPD | Le Pakistan n'a pas de « décision d'adéquation » de l'Union européenne. S'il a accès aux données de tes clients, il faut des **clauses contractuelles types** (CCT). |
| Communication | Décalage horaire, langue, délais de réponse en cas de panne un vendredi soir |

### Les 10 conditions pour dire oui 🛡️
1. **Un cahier des charges écrit** : la liste précise des écrans et des fonctions (voir §2).
2. **Un paiement en 3 fois** : 30 % au démarrage, 40 % à la démo qui fonctionne, 30 % après **2 semaines de test réel** dans un restaurant.
3. **Le code source sur TON compte GitHub** dès le premier jour.
4. **Tous les comptes à TON nom** : Meta Business, Stripe, serveur, nom de domaine. Tu lui donnes seulement des accès, que tu peux lui retirer.
5. **Un contrat qui définit l'assistance** : délai de réponse (par exemple 24 h pour une panne), et ce qui est inclus (corrections de bugs) ou non (nouvelles fonctions).
6. **Une documentation** pour qu'un autre développeur puisse reprendre le projet.
7. **Des références** : demande-lui une démo d'un bot WhatsApp Cloud API qu'il a déjà réalisé.
8. **Une plateforme qui protège le paiement** (Upwork, Malt, Fiverr Pro), plutôt qu'un virement direct.
9. **Les clauses RGPD** (CCT) si des données personnelles passent par lui.
10. **Une réserve de secours** d'environ **1 000 €** si tu dois changer de développeur.

👉 **Mon avis :** c'est **intéressant si tu signes un contrat avec ces protections**. Sans contrat, la « lifetime assistance » ne vaut rien.

---

## 2. Ce que doit contenir l'application (cahier des charges minimum)

| Partie | Fonctions |
|---|---|
| **Robot WhatsApp** (API Cloud de Meta) | Accueil, menu (catalogue), options (sauces, tailles), panier, retrait ou livraison, adresse, récapitulatif, lien de paiement, confirmation, avis |
| **Paiement** | Stripe Connect : le client paie le restaurant, et **ton 1 € est prélevé automatiquement** (« application fee ») |
| **Espace restaurant** (web, sur tablette) | Réception des commandes avec son, accepter/refuser, temps de préparation, modifier le menu et les prix, marquer un plat en rupture, ouvrir ou fermer, statistiques |
| **Ton espace administrateur** | Liste des restaurants, commandes par restaurant, **facturation automatique du 1 € par commande** |
| **Légal** | Allergènes par plat, lien vers les CGV, consentement marketing |

---

## 3. Les hypothèses de calcul

| Élément | Valeur |
|---|---|
| Ton prix | **1 € HT par commande** |
| Jours d'ouverture d'un restaurant | 28 par mois |
| Montée en charge d'un nouveau restaurant | 40 % le 1er mois, 70 % le 2e, 100 % à partir du 3e |
| Nouveaux restaurants | 1 au mois 1, 2 au mois 2, 2 au mois 3 (**5 restaurants à 3 mois**), puis +2 par mois en année 1, +3 en année 2, +4 en année 3 |
| Développement | 3 000 € payés au départ |
| Charges fixes | 150 €/mois (serveur, nom de domaine, assurance, téléphone, outils) + 50 €/mois de réserve technique |
| Par restaurant | 5 €/mois (numéro, frais Stripe Connect) + 80 € de kit de lancement (QR codes, flyers) |
| Par commande | 0,03 € (messages WhatsApp hors fenêtre de 24 h, serveur) |
| Cotisations sociales | ≈ 22 % du chiffre d'affaires (micro-entreprise, prestations de services, taux à vérifier) |
| Frais bancaires Stripe | **Payés par le restaurant** (c'est lui qui encaisse) |

> ⚠️ **Le chiffre clé :** « 10 à 50 commandes par jour », c'est le total du restaurant. Mais **toutes ne passeront pas par WhatsApp** : une partie restera sur Uber Eats, au téléphone ou sur place. Prends donc le **scénario prudent (10 par jour)** pour décider.

---

## 4. Les 12 premiers mois : scénario prudent (10 commandes WhatsApp par jour et par restaurant)

| Mois | Restos | Commandes | Chiffre d'affaires | Charges* | Résultat du mois | Trésorerie cumulée |
|---|---|---|---|---|---|---|
| 1 | 1 | 112 | 112 € | 313 € | − 201 € | − 3 201 € |
| 2 | 3 | 420 | 420 € | 480 € | − 60 € | − 3 261 € |
| 3 | 5 | 896 | 896 € | 609 € | + 287 € | − 2 974 € |
| 4 | 7 | 1 456 | 1 456 € | 759 € | + 697 € | − 2 277 € |
| 5 | 9 | 2 016 | 2 016 € | 909 € | + 1 107 € | − 1 170 € |
| 6 | 11 | 2 576 | 2 576 € | 1 059 € | + 1 517 € | **+ 347 €** ✅ |
| 9 | 17 | 4 256 | 4 256 € | 1 509 € | + 2 747 € | + 7 358 € |
| 12 | 23 | 5 936 | 5 936 € | 1 959 € | + 3 977 € | + 18 059 € |

\* Charges = charges fixes + coûts par restaurant et par commande + cotisations (22 %).

- **Argent maximum à avancer : ≈ 3 300 €** (les 3 000 € de développement + les deux premiers mois).
- **Les 3 000 € sont remboursés au mois 6.**
- Le « résultat » est **ton revenu avant impôt sur le revenu** : tu ne te verses pas de salaire à part.

---

## 5. Les 3 scénarios sur 3 ans

| | **Prudent : 10 / jour** | **Moyen : 25 / jour** | **Fort : 50 / jour** |
|---|---|---|---|
| Restaurants à 3 mois | 5 | 5 | 5 |
| Chiffre d'affaires à 3 mois (mois 3) | 896 € | 2 240 € | 4 480 € |
| Mise de départ remboursée | **mois 6** | **mois 4** | **mois 3** |
| **Année 1** : chiffre d'affaires / résultat | 34 700 € / **21 100 €** | 86 700 € / **60 100 €** | 173 500 € / **125 100 €** |
| **Année 2** (59 restos) : CA / résultat | 133 800 € / **92 500 €** | 334 500 € / **243 100 €** | 669 100 € / **494 000 €** |
| **Année 3** (107 restos) : CA / résultat | 273 600 € / **193 900 €** | 684 000 € / **501 600 €** | 1 367 900 € / **1 014 600 €** |

### Et si tu restes à 5 restaurants seulement ?

| Commandes / jour / restaurant | Revenu mensuel net (5 restaurants) |
|---|---|
| 10 | ≈ 825 € |
| 25 | ≈ 2 400 € |
| 50 | ≈ 5 025 € |

👉 Avec 5 restaurants, c'est un **complément de revenu**. Pour en vivre, il faut viser **15 à 25 restaurants**.

---

## 6. Les points d'expertise à ne pas rater

| Sujet | Ce qu'il faut savoir |
|---|---|
| **Statut** | Commence en **micro-entreprise**, c'est simple et peu coûteux. ⚠️ Le plafond est d'environ 77 700 € de CA pour les prestations de services (à vérifier) : à passer en **SASU** dès que tu approches ce montant (scénario moyen : dès l'année 1). |
| **TVA** | Franchise en dessous d'environ 37 500 € de CA (seuil à vérifier). Au-delà, tu factures **1 € HT + 0,20 € de TVA**. Le restaurant la récupère, donc ça ne lui coûte rien de plus. Écris toujours « **1 € HT** » dans tes contrats. |
| **Facturation** | Stripe Connect prélève le 1 € automatiquement à chaque paiement : **zéro impayé**. Pour le paiement en espèces, facture le restaurant chaque mois. |
| **Contrat restaurant** | Prix, durée (sans engagement, mais avec 1 mois de préavis), assistance, propriété des données clients, résiliation |
| **Meta** | Un numéro WhatsApp par restaurant (sa marque) ou un numéro commun : à décider avec le développeur. Chaque restaurant doit **accepter les conditions de Meta**. |
| **Le temps** | En autofinancement, **ton temps est le vrai coût** : prévois environ 1 jour pour installer chaque restaurant et 1 à 2 h de support par restaurant et par mois. Au-delà de 25 à 30 restaurants, il te faudra de l'aide. |
| **Perte de clients** | Les projections supposent qu'aucun restaurant ne part. En réalité, compte environ 1 départ sur 10 par an. |

---

## 7. Ton plan d'action en autofinancement

| Semaine | Action |
|---|---|
| 1 | Créer ta micro-entreprise et ouvrir les comptes Meta Business et Stripe **à ton nom** |
| 1-2 | Écrire le cahier des charges (§2) et signer avec le développeur (§1) |
| 2-6 | Développement. **En parallèle**, démarcher 10 restaurants pour en signer 3 à 5 |
| 6-8 | Restaurant n°1 en test réel pendant 2 semaines, puis dernier paiement au développeur |
| Mois 2-3 | Restaurants 2 à 5, avec QR codes et flyers dans les sacs |
| Mois 3 | Bilan : **combien de commandes WhatsApp par jour, réellement ?** Puis on ajuste les projections. |

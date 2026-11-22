# Projections en autofinancement : SASU, rémunération en dividendes uniquement

> **Le modèle :** tu vends ton outil de commande WhatsApp aux restaurants, avec ton accompagnement, pour **1 € HT par commande**. Tu ne gères **pas** de livreurs : le restaurant livre lui-même ou propose le retrait sur place.
> **La structure :** une **SASU**. Le président ne touche **aucun salaire** ; il se rémunère **uniquement en dividendes**.
> **Le financement :** **aucun prêt**, uniquement ton apport puis les revenus.
> Ce sont des hypothèses d'exemple. Les taux d'impôt sont à **confirmer avec ton expert-comptable**.

---

## 1. Comment l'argent arrive dans ta poche en SASU

```
Commandes (1 € HT chacune)
   − charges de la société (serveur, comptable, banque, kits…)
   = BÉNÉFICE
   − Impôt sur les sociétés (IS) : 15 % jusqu'à 42 500 €, puis 25 % au-delà
   = BÉNÉFICE NET  → l'assemblée générale décide de le distribuer en dividendes
   − Flat tax sur les dividendes : ≈ 31,4 % (12,8 % d'impôt + 18,6 % de prélèvements sociaux)
   = CE QUI ARRIVE SUR TON COMPTE PERSONNEL
```

| Point clé | Explication simple |
|---|---|
| **Pas de salaire = pas de cotisations sociales** | La SASU ne paie aucune charge sociale pour toi. |
| ⚠️ **Mais pas de protection sociale** | Pas de cotisation retraite et pas d'indemnités en cas de maladie via ta société. Pense à une **épargne retraite** et à une **prévoyance**. |
| **Taux réduit d'IS à 15 %** | Valable sur les 42 500 premiers euros de bénéfice si le capital est entièrement **libéré** et détenu **par toi** (personne physique) |
| **Flat tax ≈ 31,4 %** | 30 % jusqu'en 2025 ; la hausse de CSG votée pour 2026 la porte à environ 31,4 %. **À confirmer avec ton comptable.** Tu peux aussi choisir le barème de l'impôt sur le revenu avec un abattement de 40 % si c'est plus avantageux pour toi. |
| **Les dividendes sont versés une fois par an** | Après la clôture des comptes et l'assemblée générale (dans les 6 mois). Le premier versement arrive donc vers le **mois 13 à 18**. Un acompte en cours d'année est possible avec un bilan intermédiaire. |
| **France Travail** | En SASU sans salaire, les allocations (ARE) peuvent en général être maintenues. **À vérifier** avec ton conseiller. |

### 💡 L'astuce : le compte courant d'associé

Mets **1 000 € en capital**, et prête les **3 500 € de démarrage** (développement + création) à ta société via un **compte courant d'associé**.

👉 Quand la société commence à gagner de l'argent, elle te **rembourse ces 3 500 € sans aucun impôt**, car c'est ton propre argent qui revient. C'est ton premier « revenu », bien avant les dividendes.

---

## 2. Les hypothèses de calcul

| Élément | Valeur |
|---|---|
| Ton prix | **1 € HT par commande** (Stripe Connect le prélève automatiquement) |
| Jours d'ouverture d'un restaurant | 28 par mois |
| Montée en charge d'un nouveau restaurant | 40 % le 1er mois, 70 % le 2e, 100 % à partir du 3e |
| Nouveaux restaurants | 1, 2, 2 (**5 restaurants à 3 mois**), puis +2 par mois en année 1, +3 en année 2, +4 en année 3 |
| Départ | Développement 3 000 € + création de la SASU ≈ 500 € (annonce légale, greffe, statuts) |
| Charges fixes | 340 €/mois : outils et serveur 150 €, réserve technique 50 €, **expert-comptable 120 €**, banque pro 20 € |
| CFE | 0 € la première année (exonération), puis ≈ 300 €/an |
| Par restaurant | 5 €/mois + 80 € de kit de lancement |
| Par commande | 0,03 € |
| Salaire du président | **0 €** |

> ⚠️ « 10 à 50 commandes par jour » correspond au total du restaurant, pas uniquement à WhatsApp. **Décide avec le scénario prudent (10 par jour).**

---

## 3. Les 12 premiers mois : scénario prudent (10 commandes WhatsApp par jour et par restaurant)

| Mois | Restos | Commandes | Résultat du mois | Trésorerie de la société |
|---|---|---|---|---|
| 0 | 0 | 0 | — | − 3 500 € (ton apport en compte courant) |
| 1 | 1 | 112 | − 316 € | − 3 816 € |
| 2 | 3 | 420 | − 108 € | − 3 924 € |
| 3 | 5 | 896 | + 344 € | − 3 580 € |
| 4 | 7 | 1 456 | + 877 € | − 2 703 € |
| 5 | 9 | 2 016 | + 1 411 € | − 1 292 € |
| 6 | 11 | 2 576 | + 1 944 € | **+ 652 €** ✅ |
| 9 | 17 | 4 256 | + 3 543 € | + 9 682 € |
| 12 | 23 | 5 936 | + 5 143 € | + 23 511 € |

- **Argent total à avancer : ≈ 3 900 €** (3 500 € au départ, plus environ 400 € pour couvrir les deux premiers mois).
- **Ton apport peut t'être remboursé, sans impôt, à partir du mois 6.**

---

## 4. Les 3 scénarios sur 3 ans

### Scénario prudent : 10 commandes par jour et par restaurant

| | Année 1 | Année 2 | Année 3 |
|---|---|---|---|
| Restaurants (fin d'année) | 23 | 59 | 107 |
| Chiffre d'affaires | 34 692 € | 133 812 € | 273 588 € |
| Charges | 11 181 € | 13 824 € | 21 528 € |
| **Bénéfice** | 23 511 € | 119 988 € | 252 060 € |
| Impôt sur les sociétés | − 3 527 € | − 25 747 € | − 58 765 € |
| Bénéfice net (distribuable) | 19 985 € | 94 241 € | 193 295 € |
| **💰 Dividendes nets dans ta poche** (après flat tax) | **≈ 13 700 €** | **≈ 64 600 €** | **≈ 132 600 €** |

### Scénario moyen : 25 commandes par jour

| | Année 1 | Année 2 | Année 3 |
|---|---|---|---|
| Chiffre d'affaires | 86 730 € | 334 530 € | 683 970 € |
| Bénéfice | 73 988 € | 314 684 € | 650 131 € |
| Impôt sur les sociétés | − 14 247 € | − 74 421 € | − 158 283 € |
| **💰 Dividendes nets** | **≈ 41 000 €** | **≈ 164 800 €** | **≈ 337 400 €** |

### Scénario fort : 50 commandes par jour

| | Année 1 | Année 2 | Année 3 |
|---|---|---|---|
| Chiffre d'affaires | 173 460 € | 669 060 € | 1 367 940 € |
| Bénéfice | 158 116 € | 639 178 € | 1 313 582 € |
| Impôt sur les sociétés | − 35 279 € | − 155 545 € | − 324 145 € |
| **💰 Dividendes nets** | **≈ 84 300 €** | **≈ 331 800 €** | **≈ 678 800 €** |

En plus des dividendes, tu récupères en année 1 tes **3 500 € d'apport** sans impôt (compte courant d'associé).

### Et si tu restes à 5 restaurants ?

| Commandes / jour / restaurant | Bénéfice annuel | Dividendes nets par an | Soit par mois |
|---|---|---|---|
| 10 | 11 916 € | ≈ 6 950 € | **≈ 580 €** |
| 25 | 36 360 € | ≈ 21 200 € | **≈ 1 770 €** |
| 50 | 77 100 € | ≈ 42 600 € | **≈ 3 550 €** |

---

## 5. Ce qu'il faut savoir sur la SASU en dividendes

| Sujet | À retenir |
|---|---|
| **Fiscalité totale** | Sur 100 € de bénéfice, tu touches environ **58 €** : 15 % d'IS, puis environ 31,4 % sur le reste. |
| **SASU contre micro-entreprise avec 5 restaurants** | La SASU coûte plus cher au début (comptable, banque, double imposition). Avec 5 restaurants à 10 commandes par jour, tu touches environ 580 €/mois en SASU, contre environ 825 €/mois en micro. **La SASU devient intéressante quand le volume augmente.** Elle rassure aussi les restaurants et elle n'a pas de plafond de chiffre d'affaires. |
| **Expert-comptable** | En pratique indispensable (bilan, liasse fiscale, assemblée générale) : compte 1 200 à 2 000 €/an |
| **TVA** | Franchise possible sous environ 37 500 € de CA (seuil à vérifier). Au-delà : 1 € HT + 0,20 € de TVA, que le restaurant récupère. |
| **Réserve légale** | 5 % du bénéfice à mettre de côté jusqu'à atteindre 10 % du capital : avec 1 000 € de capital, ça ne fait que 100 € au total. |
| **Garder de la trésorerie** | Ne distribue pas 100 % du bénéfice. Garde au moins **3 mois de charges** dans la société en cas de panne ou de restaurant qui part. |
| **Grossir seul ?** | Au-delà de 25 à 30 restaurants, tu auras besoin d'aide (installation des restaurants, support). Les années 2 et 3 supposent que tu embauches ou que tu sous-traites, ce qui **réduira** ces bénéfices. |

---

## 6. L'offre du développeur à 3 000 €

👉 **C'est intéressant si tu signes un contrat avec ces protections.** Sans contrat, la « lifetime assistance » ne vaut rien.

1. **Un cahier des charges écrit** (voir §7).
2. **Un paiement en 3 fois** : 30 % au démarrage, 40 % à la démo, 30 % après 2 semaines de test dans un vrai restaurant.
3. **Le code source sur le GitHub de ta SASU** dès le premier jour.
4. **Tous les comptes au nom de la SASU** : Meta Business, Stripe, serveur, nom de domaine.
5. **Un contrat qui définit l'assistance** : délais de réponse, ce qui est inclus (bugs) ou non (nouvelles fonctions).
6. **Une documentation** pour qu'un autre développeur puisse reprendre le projet.
7. **Des références**, avec la démo d'un bot WhatsApp Cloud API qu'il a déjà réalisé.
8. **Une plateforme qui protège le paiement** (Upwork, Malt, Fiverr Pro).
9. **Les clauses RGPD** : clauses contractuelles types, car le Pakistan est hors de l'Union européenne.
10. **Une réserve de secours** d'environ 1 000 €.

---

## 7. Le cahier des charges minimum de l'application

| Partie | Fonctions |
|---|---|
| Robot WhatsApp (API Cloud) | Accueil, menu, options, panier, retrait ou livraison, adresse, récapitulatif, paiement, confirmation, avis |
| Paiement | Stripe Connect avec un prélèvement automatique de **1 € par commande** |
| Espace restaurant (tablette) | Commandes avec alerte sonore, accepter/refuser, temps de préparation, menu et prix, ruptures, ouverture et fermeture, statistiques |
| Ton espace administrateur | Restaurants, commandes, facturation automatique |
| Légal | Allergènes, CGV, consentement marketing |

---

## 8. Ton plan d'action

| Quand | Action |
|---|---|
| Semaine 1 | Créer la **SASU** (capital de 1 000 € entièrement libéré + 3 500 € en compte courant d'associé), ouvrir un compte bancaire pro, choisir un expert-comptable |
| Semaine 1-2 | Ouvrir les comptes Meta Business et Stripe **au nom de la SASU**, signer avec le développeur |
| Semaines 2-6 | Développement, et en parallèle démarcher 10 restaurants pour en signer 3 à 5 |
| Semaines 6-8 | Restaurant n°1 en test réel, puis dernier paiement au développeur |
| Mois 2-3 | Restaurants 2 à 5 |
| Mois 6 | Début du remboursement de ton compte courant (sans impôt) |
| Fin d'année 1 | Clôture des comptes, puis assemblée générale et **premiers dividendes** |

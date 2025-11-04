# 🎯 Prochaines Étapes - Guide de Démarrage

## Vous êtes ICI 👇

```
[✅ Code complet] → [🔄 VOUS ÊTES ICI] → [🚀 Production] → [📈 Optimisation]
```

---

## 🏃 Actions Immédiates (Maintenant !)

### 1. Vérifier que tout fonctionne (5 min)

```bash
# Terminal 1 : Serveur
cd "/Users/baptistepiocelle/Desktop/Landing Page BPCORP/bpc-funnels"
nvm use 20
npm run dev

# Terminal 2 : Health check
curl http://localhost:3000/api/health | jq
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "checks": {
    "env": true,
    "database": true
  }
}
```

### 2. Créer votre premier funnel RÉEL (10 min)

#### Option A : Via l'interface (recommandé)

1. Ouvrir http://localhost:3000 (en navigation privée si problème cache)
2. Se connecter
3. **"+ Créer un funnel"**
4. Nom : `FlipImmo - Guide Investissement`
5. Template : **Quiz Multi-Étapes**
6. **Créer** → Vous arrivez dans le builder

#### Option B : Via SQL (plus rapide)

Exécuter dans Supabase SQL Editor :

```bash
# Utiliser le script de seed
cat scripts/seed.sh
# Copier le SQL et exécuter
```

### 3. Configurer le routage (5 min)

1. Dans le funnel → **"Configuration du routage"**
2. **Ajouter une règle** :
   - Champ : `capital`
   - Opérateur : `>`
   - Valeur : `50000`
   - Client : `FMDB - Premium`
   - Webhook : https://webhook.site/VOTRE-URL ← **Créer sur webhook.site**
3. **Sauvegarder**

### 4. TESTER en situation réelle (2 min)

```bash
# Activer le funnel dans Supabase
UPDATE funnels SET status = 'active' WHERE slug = 'flipimmo-guide';
```

Puis :

1. Ouvrir http://localhost:3000/f/flipimmo-guide
2. Remplir le formulaire
3. Soumettre
4. ✅ Vérifier sur webhook.site que le lead arrive !
5. ✅ Vérifier dans Dashboard > Leads

---

## 📅 Cette Semaine

### Jour 1-2 : Setup Production

- [ ] Créer repo GitHub privé
- [ ] Pusher le code
- [ ] Créer compte Vercel
- [ ] Déployer (suivre `DEPLOYMENT.md`)
- [ ] Configurer domaine custom (optionnel)

### Jour 3-4 : Premiers Funnels

- [ ] Créer funnel FlipImmo
- [ ] Créer funnel PapaPrévoit
- [ ] Créer funnel FundStream
- [ ] Configurer tracking (Meta Pixel, GA4)
- [ ] Tester A/B testing sur chaque

### Jour 5-7 : Optimisation

- [ ] Analyser premières données
- [ ] Ajuster variantes selon conversions
- [ ] Créer templates personnalisés
- [ ] Former l'équipe (si applicable)

---

## 🎓 Fonctionnalités à Découvrir

### Dans le Dashboard

**Form Builder** :
- Drag & drop des étapes et champs
- Device preview (📱 💻 🖥️)
- Command palette : `Cmd + K`
- Undo/Redo : `Cmd + Z` / `Cmd + Shift + Z`
- Auto-save toutes les 3 secondes

**Analytics** :
- Charts interactifs
- Funnel visualization
- A/B/C comparison
- Export données

**Routing** :
- Visual flow (si Agent #3 l'a fait)
- Test simulator
- Webhook testing

### Nouveautés UX

- **Selectable Cards** : Plus de radio circles moches !
- **Dark Mode** : Toggle en haut à droite
- **Empty States** : Illustrations + CTAs clairs
- **Loading States** : Skeleton loaders partout
- **Mobile Perfect** : Responsive natif

---

## 🔗 Intégrations Recommandées

### Webhooks

1. **LeadProsper** (si vous l'utilisez)
   - Voir `docs/WEBHOOKS.md`
   - Endpoint: https://api.leadprosper.io/v1/leads

2. **Zapier** (automatisation)
   - Créer Zap avec Webhook trigger
   - Connecter à CRM, Email, etc.

3. **Make.com** (alternative Zapier)
   - Custom webhook
   - Scénarios avancés

### Tracking

1. **Meta Pixel** : Dans tracking config
2. **Google Analytics 4** : Dans tracking config
3. **Google Tag Manager** : Dans tracking config

---

## 📈 KPIs à Suivre

### Semaine 1

- Nombre de funnels créés
- Taux de conversion moyen
- Nombre de leads collectés
- Taux d'envoi webhook (devrait être ~98%)

### Mois 1

- Best performing funnel
- Meilleure variante A/B/C
- Client le plus profitable
- ROI par source UTM

---

## 🐛 Troubleshooting Rapide

### Problème : "Failed to fetch" au login

**Solution** :
1. Vider cache navigateur (`Cmd + Shift + R`)
2. Utiliser navigation privée
3. Vérifier `.env.local` (bonnes clés)
4. Vérifier Supabase > Auth > URL Configuration

### Problème : Funnel introuvable

**Solution** :
1. Vérifier status = `active` dans Supabase
2. Vérifier slug exact
3. Tester : `/api/health`

### Problème : Leads non routés

**Solution** :
1. Vérifier au moins 1 règle de routage
2. Tester webhook avec `./scripts/test-webhook.sh`
3. Voir Dashboard > Leads > colonne Status

### Problème : Build échoue

**Solution** :
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 🎁 Bonus : Checklist de Lancement

```
TECHNIQUE
□ Tests E2E passent (npm run test)
□ Build réussit (npm run build)
□ Health check OK (/api/health)
□ Aucune erreur TypeScript (npm run type-check)

CONFIGURATION
□ Variables env en production (Vercel)
□ Domaine custom configuré (optionnel)
□ SSL/HTTPS actif
□ Tracking pixels configurés

CONTENU
□ Au moins 1 funnel de prod créé
□ Règles de routage testées
□ Webhook de destination vérifié
□ Page thank-you personnalisée

SÉCURITÉ
□ Compte admin sécurisé
□ Supabase RLS (si multi-user)
□ Secrets non committés
□ Backup BDD configuré

BUSINESS
□ Premiers leads test collectés
□ Analytics fonctionnelles
□ Campagne de lancement prête
□ Documentation équipe (si team)
```

---

## ✉️ Rester en Contact

Si vous avez des questions ou bugs :

1. Consulter la doc (`docs/`)
2. Vérifier les logs
3. Tester avec `./scripts/test-webhook.sh`
4. Contacter le support (vous-même 😄)

---

## 🎉 Félicitations !

Vous avez entre les mains un **outil SaaS production-ready** qui va vous faire gagner des heures chaque semaine.

**Prochaine action** : Créer votre premier funnel et collecter vos premiers leads ! 🚀

---

_Bon lancement ! 💪_


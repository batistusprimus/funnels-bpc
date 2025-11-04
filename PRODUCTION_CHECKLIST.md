# ✅ Checklist Production - BPC Funnels

## 🎯 Objectif

Mettre BPC Funnels en production sur Vercel avec votre premier funnel fonctionnel.

**Temps estimé** : 30 minutes

---

## 📋 Checklist Complète

### ☐ 1. Vérifications Locales (5 min)

```bash
# Test de santé
curl http://localhost:3000/api/health

# Vérifier les erreurs TypeScript
npm run type-check

# Build de production
npm run build
```

**Résultat attendu** : Pas d'erreurs ✅

---

### ☐ 2. Préparer le Repository GitHub (5 min)

```bash
cd "/Users/baptistepiocelle/Desktop/Landing Page BPCORP/bpc-funnels"

# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "feat: BPC Funnels v1.0 - Production Ready

- ✅ MVP complet avec Form Builder
- ✅ Routage automatique des leads
- ✅ A/B/C testing
- ✅ Analytics en temps réel
- ✅ Mobile responsive
- ✅ Selectable Cards UX
- ✅ Auto-save, drag & drop
- ✅ Dark mode, animations
- ✅ Docker, tests E2E
- ✅ Documentation complète"

# Créer repo sur GitHub.com puis :
git remote add origin https://github.com/VOTRE-USERNAME/bpc-funnels.git
git branch -M main
git push -u origin main
```

---

### ☐ 3. Déployer sur Vercel (10 min)

#### 3.1 Import sur Vercel

1. Aller sur https://vercel.com
2. **"New Project"**
3. Importer votre repo GitHub `bpc-funnels`
4. Configuration :
   - Framework: **Next.js** (auto-détecté)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 3.2 Variables d'Environnement

Dans **Environment Variables**, ajouter :

```env
NEXT_PUBLIC_SUPABASE_URL=https://aaewiyyxmvhmlnmcldly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note** : Laissez `NEXT_PUBLIC_APP_URL` vide pour l'instant !

#### 3.3 Déployer

1. Cliquer **"Deploy"**
2. Attendre 2-3 minutes
3. Noter l'URL : `https://bpc-funnels.vercel.app`

#### 3.4 Mettre à jour APP_URL

1. Settings > Environment Variables
2. Ajouter : `NEXT_PUBLIC_APP_URL=https://bpc-funnels.vercel.app`
3. Redéployer (Deployments > ... > Redeploy)

---

### ☐ 4. Configurer Supabase pour Production (3 min)

Dans **Supabase** > **Authentication** > **URL Configuration** :

**Ajouter les Redirect URLs** :
```
https://bpc-funnels.vercel.app/**
https://*.vercel.app/**
```

**Sauvegarder** !

---

### ☐ 5. Créer votre Premier Funnel de Prod (5 min)

1. Aller sur `https://bpc-funnels.vercel.app`
2. Se connecter
3. **"+ Créer un funnel"**
   - Nom : `FlipImmo - Guide Investissement 2025`
   - Slug : `flipimmo-guide`
   - Template : **Quiz Multi-Étapes**
   - Meta Pixel : (votre ID si disponible)
4. **Créer**

---

### ☐ 6. Personnaliser le Funnel (5 min)

Dans le **Builder** :

**Landing** :
- Titre : Votre accroche
- Sous-titre : Votre promesse
- Couleur : Votre branding

**Formulaire** :
- Ajouter/retirer des champs (drag & drop)
- Personnaliser les questions
- Définir le flow (nextStep)

**Thank You** :
- Message personnalisé
- CTA vers Calendly (optionnel)

**Sauvegarder** (auto-save actif)

---

### ☐ 7. Configurer le Routage (5 min)

1. **Configuration du routage**
2. Créer vos règles (exemple) :

**Règle 1 - Leads Premium** :
- Si `capital` > `50000`
- Client : `FMDB`
- Webhook : `https://votre-crm.com/api/leads-premium`

**Règle 2 - Leads Standard** :
- Si `capital` ≤ `50000`
- Client : `La Relève`
- Webhook : `https://votre-crm.com/api/leads-standard`

**Règle 3 - Fallback** :
- Si `email` contains `@`
- Client : `Default`
- Webhook : `https://webhook.site/fallback`

3. **Sauvegarder**

---

### ☐ 8. Activer le Funnel (1 min)

Dans **Supabase** > **Table Editor** > **funnels** :

```sql
UPDATE funnels 
SET status = 'active' 
WHERE slug = 'flipimmo-guide';
```

---

### ☐ 9. Tester en Production (2 min)

1. Ouvrir `https://bpc-funnels.vercel.app/f/flipimmo-guide`
2. Remplir le formulaire
3. Soumettre
4. ✅ Vérifier Dashboard > Leads
5. ✅ Vérifier webhook de destination

---

### ☐ 10. Configurer Domaine Custom (Optionnel)

#### Sur Vercel

1. Settings > Domains
2. Ajouter : `funnels.votredomaine.com`
3. Suivre instructions DNS

#### Chez votre Registrar

```
Type: CNAME
Name: funnels
Value: cname.vercel-dns.com
```

#### Mettre à jour Supabase

Ajouter `https://funnels.votredomaine.com/**` aux Redirect URLs

---

## 🎊 C'est Prêt !

Vous avez maintenant :

✅ Application déployée sur Vercel  
✅ Premier funnel actif  
✅ Routage configuré  
✅ Analytics fonctionnels  
✅ Mobile responsive  
✅ UX moderne  

**URL publique à partager** :
```
https://bpc-funnels.vercel.app/f/flipimmo-guide
```

---

## 📊 Monitoring

### Vérifier la Santé

```bash
curl https://bpc-funnels.vercel.app/api/health
```

### Logs Vercel

1. Deployments > Votre deploy > Runtime Logs
2. Voir erreurs en temps réel

### Analytics

1. Dashboard > Votre funnel > Analytics
2. Suivre conversions, A/B testing, distribution

---

## 🚀 Campagnes Marketing

Votre funnel est prêt pour :

- ✅ Facebook Ads
- ✅ Google Ads
- ✅ Email campaigns
- ✅ LinkedIn Ads
- ✅ Organic social
- ✅ SEO (sitemap activé)

**Tracking UTM** :
```
https://bpc-funnels.vercel.app/f/flipimmo-guide?utm_source=facebook&utm_campaign=janvier2025
```

---

## 🔥 Quick Wins

### Semaine 1

1. Créer 3 funnels minimum (FlipImmo, PapaPrévoit, FundStream)
2. Lancer A/B testing sur chaque
3. Collecter premiers 100 leads
4. Analyser performances

### Mois 1

1. Optimiser variantes selon data
2. Dupliquer best performers
3. Intégrer LeadProsper (docs/WEBHOOKS.md)
4. Former l'équipe

---

## 🎓 Ressources

- **Documentation** : `docs/` folder
- **Scripts** : `scripts/` folder
- **Tests** : `npm run test:ui`
- **Health** : `/api/health`

---

**Vous êtes prêt à scaler ! 💪**

_Bon lancement ! 🚀_


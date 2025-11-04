# 🚀 Déploiement Vercel - funnels.bpcorp.eu

**Domaine cible** : funnels.bpcorp.eu  
**Repository** : https://github.com/batistusprimus/funnels-bpc.git

---

## 📋 Checklist Déploiement

### ✅ ÉTAPE 1 : Import sur Vercel (2 min)

1. Aller sur https://vercel.com
2. **New Project**
3. Import : `batistusprimus/funnels-bpc`
4. Configuration :
   - Framework: **Next.js** ✓ (auto-détecté)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Install Command: `npm install`

### ✅ ÉTAPE 2 : Variables d'Environnement (3 min)

**⚠️ IMPORTANT** : Ajouter ces 3 variables avant de déployer

```env
NEXT_PUBLIC_SUPABASE_URL=https://aaewiyyxmvhmlnmcldly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(votre clé)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(votre clé)
```

**NE PAS** mettre `NEXT_PUBLIC_APP_URL` maintenant ! (sera ajouté après)

### ✅ ÉTAPE 3 : Premier Déploiement (3 min)

1. Cliquer **"Deploy"**
2. Attendre la fin du build (2-3 min)
3. Noter l'URL générée : `https://funnels-bpc-xxxx.vercel.app`
4. **Tester** : Ouvrir l'URL, se connecter

### ✅ ÉTAPE 4 : Ajouter APP_URL (1 min)

1. Settings > Environment Variables
2. Ajouter : `NEXT_PUBLIC_APP_URL=https://funnels-bpc-xxxx.vercel.app`
3. Redéployer : Deployments > ... > Redeploy

### ✅ ÉTAPE 5 : Configurer Domaine Custom (5 min)

#### Dans Vercel

1. Settings > Domains
2. Add : `funnels.bpcorp.eu`
3. Vercel vous donnera les DNS à configurer

#### DNS à Configurer

Chez votre registrar (OVH, Cloudflare, etc.) :

```
Type: CNAME
Name: funnels
Value: cname.vercel-dns.com
TTL: Auto ou 3600
```

**Ou si c'est un sous-domaine géré par Cloudflare** :

```
Type: CNAME
Name: funnels
Value: cname.vercel-dns.com
Proxy status: DNS only (⚠️ désactiver le proxy orange)
```

#### Vérification DNS

```bash
dig funnels.bpcorp.eu
# Attendre propagation (1-30 min)
```

### ✅ ÉTAPE 6 : Mettre à Jour Variables (2 min)

Une fois le domaine actif :

1. Vercel > Settings > Environment Variables
2. **Modifier** `NEXT_PUBLIC_APP_URL` : `https://funnels.bpcorp.eu`
3. Redéployer

### ✅ ÉTAPE 7 : Configurer Supabase (2 min)

Dans **Supabase** > **Authentication** > **URL Configuration** :

**Site URL** :
```
https://funnels.bpcorp.eu
```

**Redirect URLs** (ajouter) :
```
https://funnels.bpcorp.eu/**
https://funnels-bpc-*.vercel.app/**
```

**Sauvegarder** !

---

## 🧪 Tests Post-Déploiement

### Test 1 : Health Check

```bash
curl https://funnels.bpcorp.eu/api/health
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

### Test 2 : Login

1. https://funnels.bpcorp.eu/login
2. Se connecter
3. ✅ Doit rediriger vers `/funnels`

### Test 3 : Funnel Public

1. Créer un funnel de test
2. Activer (`status = 'active'`)
3. Tester : `https://funnels.bpcorp.eu/f/votre-slug`
4. Soumettre un lead
5. ✅ Vérifier dans Dashboard > Leads

---

## 🎯 URLs Finales

| Service | URL |
|---------|-----|
| **Dashboard** | https://funnels.bpcorp.eu |
| **Login** | https://funnels.bpcorp.eu/login |
| **Setup** | https://funnels.bpcorp.eu/setup |
| **API Docs** | https://funnels.bpcorp.eu/api-docs |
| **Health** | https://funnels.bpcorp.eu/api/health |
| **Funnel Public** | https://funnels.bpcorp.eu/f/[slug] |

---

## 🔧 Configuration Optimale Vercel

### Build & Output Settings

- Build Command: `npm run build` ✓
- Output Directory: `.next` ✓
- Install Command: `npm install` ✓
- Development Command: `npm run dev` ✓

### Functions

- Node.js Version: **20.x** (vérifier dans Settings)
- Region: **iad1** (Paris pour Europe)

### Headers (Optionnel - Sécurité)

Settings > Headers :

```json
[
  {
    "source": "/(.*)",
    "headers": [
      {
        "key": "X-Frame-Options",
        "value": "DENY"
      },
      {
        "key": "X-Content-Type-Options",
        "value": "nosniff"
      },
      {
        "key": "Referrer-Policy",
        "value": "strict-origin-when-cross-origin"
      }
    ]
  }
]
```

---

## 🚨 Troubleshooting

### Build échoue sur Vercel

**Cause** : Dependencies ou TypeScript errors  
**Solution** :
```bash
# Local test
npm run build

# Si erreurs, les corriger puis push
```

### 500 Error après déploiement

**Cause** : Variables env incorrectes  
**Solution** : Vérifier les 3 variables dans Vercel Settings

### Domaine ne résout pas

**Cause** : DNS pas propagé ou mal configuré  
**Solution** :
```bash
# Vérifier DNS
dig funnels.bpcorp.eu
nslookup funnels.bpcorp.eu

# Attendre 5-30 min propagation
```

### Login ne marche pas en prod

**Cause** : Redirect URLs Supabase  
**Solution** : Ajouter `https://funnels.bpcorp.eu/**` dans Supabase Auth > URL Configuration

---

## 🎉 Succès !

Une fois déployé, vous aurez :

✅ Application en HTTPS  
✅ Domaine custom `funnels.bpcorp.eu`  
✅ Auto-scaling Vercel  
✅ Edge network mondial  
✅ Analytics Vercel  
✅ Logs en temps réel  

**Temps de déploiement total** : ~20 minutes  
**Coût Vercel** : Gratuit jusqu'à 100GB bandwidth  

---

_Ready to ship! 🚀_


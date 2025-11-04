# 🚀 Guide de Déploiement - BPC Funnels

## Déploiement sur Vercel (Recommandé)

### Prérequis

- Compte GitHub avec le repository poussé
- Compte Vercel
- Projet Supabase configuré et migrations exécutées

### Étapes

#### 1. Préparer le repository

```bash
# S'assurer que tout est commité
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Importer sur Vercel

1. Aller sur https://vercel.com
2. Cliquer sur **"New Project"**
3. Sélectionner votre repository GitHub
4. Configuration du projet :
   - **Framework Preset** : Next.js (auto-détecté)
   - **Root Directory** : `./`
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (par défaut)

#### 3. Configurer les variables d'environnement

Dans les paramètres du projet, ajouter :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

> ⚠️ **Important** : Ne PAS mettre `NEXT_PUBLIC_APP_URL` tout de suite. Vercel va générer l'URL après le premier déploiement.

#### 4. Déployer

1. Cliquer sur **"Deploy"**
2. Attendre la fin du build (2-3 minutes)
3. Noter l'URL générée (ex: `bpc-funnels.vercel.app`)

#### 5. Mettre à jour NEXT_PUBLIC_APP_URL

1. Aller dans **Settings** > **Environment Variables**
2. Ajouter ou modifier `NEXT_PUBLIC_APP_URL` avec l'URL Vercel
3. Redéployer (Settings > Deployments > ... > Redeploy)

#### 6. Tester

1. Ouvrir l'URL Vercel
2. Se connecter avec vos identifiants Supabase
3. Créer un funnel de test
4. Tester la page publique : `https://votre-app.vercel.app/f/votre-slug`

## Configuration d'un Domaine Personnalisé

### Option 1 : Domaine Vercel

Par défaut, Vercel fournit : `votre-projet.vercel.app`

### Option 2 : Domaine Personnalisé

#### Sur Vercel

1. Aller dans **Settings** > **Domains**
2. Cliquer sur **"Add"**
3. Entrer votre domaine (ex: `funnels.bpcorp.fr`)
4. Vercel vous donnera les enregistrements DNS à configurer

#### Chez votre registrar DNS

Ajouter les enregistrements fournis par Vercel :

**Pour un domaine racine (example.com)** :
```
Type: A
Name: @
Value: 76.76.21.21
```

**Pour un sous-domaine (funnels.example.com)** :
```
Type: CNAME
Name: funnels
Value: cname.vercel-dns.com
```

#### Vérifier

Attendre la propagation DNS (quelques minutes à 24h)
```bash
dig funnels.bpcorp.fr
```

## Déploiement Manuel (Alternative)

### Sur un VPS Linux

#### 1. Prérequis serveur

```bash
# Installer Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
sudo npm install -g pm2
```

#### 2. Déployer l'application

```bash
# Cloner le repo
git clone <repository-url>
cd bpc-funnels

# Installer les dépendances
npm install

# Créer le fichier .env.local
nano .env.local
# Coller les variables d'environnement

# Build
npm run build

# Lancer avec PM2
pm2 start npm --name "bpc-funnels" -- start
pm2 save
pm2 startup
```

#### 3. Configurer Nginx

```nginx
server {
    listen 80;
    server_name funnels.bpcorp.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4. SSL avec Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d funnels.bpcorp.fr
```

## Monitoring et Maintenance

### Logs Vercel

- Aller dans **Deployments** > cliquer sur un déploiement > **Logs**
- Voir les erreurs en temps réel

### Logs PM2 (VPS)

```bash
# Voir les logs
pm2 logs bpc-funnels

# Redémarrer
pm2 restart bpc-funnels

# Voir le status
pm2 status
```

### Base de données Supabase

- Surveiller l'utilisation dans le dashboard Supabase
- Vérifier les limites du plan gratuit :
  - 500 MB database
  - 1 GB file storage
  - 2 GB bandwidth

## Rollback en cas de problème

### Sur Vercel

1. Aller dans **Deployments**
2. Trouver un déploiement précédent stable
3. Cliquer sur **...** > **Promote to Production**

### Sur VPS

```bash
# Revenir à un commit précédent
git log
git reset --hard <commit-hash>
npm install
npm run build
pm2 restart bpc-funnels
```

## Checklist Avant Production

- [ ] Migrations SQL exécutées sur Supabase
- [ ] Utilisateur admin créé
- [ ] Variables d'environnement configurées
- [ ] Build réussi sans erreurs
- [ ] Tests de connexion OK
- [ ] Tests de création de funnel OK
- [ ] Tests de soumission de lead OK
- [ ] Webhooks de test fonctionnels
- [ ] SSL activé (HTTPS)
- [ ] Monitoring configuré

## Support

En cas de problème :
1. Vérifier les logs Vercel/PM2
2. Vérifier les logs Supabase
3. Consulter le README.md
4. Vérifier les issues GitHub

---

**Dernière mise à jour** : Janvier 2025


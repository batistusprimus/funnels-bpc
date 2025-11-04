# ⚡ ACTIONS IMMÉDIATES - BPC Funnels

**🎯 OBJECTIF** : Rendre l'application 100% fonctionnelle en 15 minutes

---

## 🚨 ÉTAPE 1 : Exécuter les Migrations SQL (5 min)

### Dans Supabase > SQL Editor

Exécutez **dans cet ordre** :

#### 1️⃣ Tags

```bash
# Ouvrir : supabase/migrations/20250105_add_tags.sql
# Copier tout le contenu
# Exécuter dans SQL Editor
```

#### 2️⃣ Templates

```bash
# Ouvrir : supabase/migrations/20250105_seed_templates.sql
# Copier tout le contenu
# Exécuter dans SQL Editor
```

#### 3️⃣ Webhooks Avancés

```bash
# Ouvrir : supabase/migrations/20250105_webhooks_advanced.sql
# Copier tout le contenu
# Exécuter dans SQL Editor
```

#### 4️⃣ Team Collaboration

```bash
# Ouvrir : supabase/migrations/20250105_team_collaboration.sql
# Copier tout le contenu
# Exécuter dans SQL Editor
```

**✅ Vérification**: Dans Supabase > Table Editor, vous devriez voir les nouvelles tables :
- `webhook_configs`
- `webhook_logs`
- `webhook_queue`
- `api_keys`
- `templates`
- `team_members`
- `activity_log`

---

## 🔄 ÉTAPE 2 : Redémarrer le Serveur (1 min)

```bash
# Arrêter le serveur actuel
pkill -f "next dev"

# Nettoyer le cache
rm -rf .next

# Relancer
cd "/Users/baptistepiocelle/Desktop/Landing Page BPCORP/bpc-funnels"
nvm use 20
npm run dev
```

**Attendre 30 secondes** que la compilation se termine.

---

## 🧪 ÉTAPE 3 : Tester les Nouvelles Fonctionnalités (10 min)

### 3.1 Dashboard Moderne

1. Aller sur **http://localhost:3000/funnels**
2. ✅ Voir le **tableau** au lieu de la grille de cards
3. ✅ Utiliser la **recherche** (barre en haut)
4. ✅ Filtrer par **statut** (draft/active)
5. ✅ Trier les colonnes (cliquer sur headers)

### 3.2 Form Builder Drag & Drop

1. Éditer un funnel → **Builder**
2. ✅ **Glisser-déposer** une étape (icône ⋮⋮)
3. ✅ **Glisser-déposer** un champ dans une étape
4. ✅ Utiliser **Device Switcher** (📱 💻 🖥️)
5. ✅ Tester **Command Palette** : `Cmd + K`

### 3.3 Analytics avec Charts

1. Funnel → **Analytics**
2. ✅ Voir les **graphiques** :
   - Line chart (évolution)
   - Bar chart (variantes)
   - Funnel visualization

### 3.4 Routing Flow Visuel

1. Funnel → **Configuration du routage**
2. ✅ Onglet **"Vue Flow"**
3. ✅ Voir le diagramme interactif
4. ✅ Zoom, minimap fonctionnels

### 3.5 Dark Mode

1. Cliquer sur l'icône **☀️ / 🌙** en haut à droite
2. ✅ Interface passe en mode sombre
3. ✅ Préférence sauvegardée

### 3.6 Templates Marketplace

1. Menu → **Templates**
2. ✅ Voir les 3 templates pré-configurés
3. ✅ Cliquer "Utiliser" sur un template
4. ✅ Funnel créé instantanément

### 3.7 Tags

1. Créer/éditer un funnel
2. ✅ Ajouter des tags (ex: "immobilier", "premium")
3. ✅ Filtrer par tags dans le dashboard

### 3.8 Mobile Components

1. Ouvrir **http://localhost:3000/example-mobile-ui**
2. ✅ Tester BottomSheet
3. ✅ Tester SwipeDrawer
4. ✅ Tester PullToRefresh

---

## 🎯 ÉTAPE 4 : Créer Votre Premier Funnel de Production

### Utiliser le nouveau système

1. **Dashboard** → "+ Créer un funnel"
2. **Marketplace** → "Immobilier - Guide Investisseur" → "Utiliser"
3. **Builder** → Drag & drop pour personnaliser
4. **Routing** → Configurer avec Flow Builder
5. **Activer** :
   ```sql
   UPDATE funnels SET status = 'active' WHERE slug = 'votre-slug';
   ```
6. **Tester** : http://localhost:3000/f/votre-slug

---

## 📊 ÉTAPE 5 : Monitorer

### Health Check

```bash
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

### Analytics

1. Dashboard → Analytics
2. Voir les charts en temps réel
3. Analyser A/B/C testing

---

## 🚀 ÉTAPE 6 : Déployer (Quand prêt)

### Vercel

```bash
# 1. Git commit
git add .
git commit -m "feat: BPC Funnels v1.0 avec toutes features avancées"
git push

# 2. Vercel import
# → GitHub → Sélectionner repo
# → Ajouter env vars
# → Deploy
```

### Post-déploiement

1. Mettre à jour `NEXT_PUBLIC_APP_URL` dans Vercel
2. Ajouter domaine prod aux Redirect URLs Supabase
3. Configurer vrais webhooks (pas webhook.site)
4. Activer monitoring (Sentry optionnel)

---

## ✅ CHECKLIST AVANT PRODUCTION

### Base de Données
- [ ] 4 migrations exécutées
- [ ] Tables créées (vérifier Table Editor)
- [ ] Templates seed OK
- [ ] User admin créé et confirmé

### Application
- [ ] Serveur démarre sans erreur
- [ ] Health check retourne "ok"
- [ ] Dashboard charge
- [ ] Drag & drop fonctionne
- [ ] Charts s'affichent
- [ ] Dark mode marche
- [ ] Templates marketplace visible

### Tests
- [ ] Créer funnel OK
- [ ] Drag & drop steps/fields OK
- [ ] Soumettre lead OK
- [ ] Webhook reçu OK
- [ ] Analytics affiche données OK

---

## 🎊 VOUS ÊTES PRÊT !

Après ces étapes, vous aurez :

✅ Application ultra-moderne  
✅ UX/UI professionnelle  
✅ Mobile responsive  
✅ Features enterprise  
✅ Monitoring complet  
✅ Documentation exhaustive  

**Temps total** : ~15 minutes  
**Résultat** : SaaS production-ready  

---

**Prochaine action** : Exécuter les migrations SQL ! 🚀


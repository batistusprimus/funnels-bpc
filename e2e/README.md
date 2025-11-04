# Tests E2E - BPC Funnels

## Installation

Les tests utilisent Playwright pour simuler les interactions utilisateur.

```bash
# Installer les navigateurs
npx playwright install
```

## Lancer les tests

```bash
# Tous les tests
npx playwright test

# Mode UI interactif
npx playwright test --ui

# Un fichier spécifique
npx playwright test e2e/funnel-creation.spec.ts

# Mode debug
npx playwright test --debug
```

## Prérequis

Avant de lancer les tests :

1. **Créer un utilisateur de test** dans Supabase :
   - Email: `baptiste@bpcorp.eu`
   - Password: `your-test-password`

2. **Créer un funnel de démo** avec slug `demo` et status `active`

3. **Le serveur doit tourner** sur http://localhost:3000

## Structure des Tests

```
e2e/
├── funnel-creation.spec.ts   # Tests de création de funnel
├── funnel-submission.spec.ts # Tests de soumission publique
└── routing.spec.ts            # Tests de configuration routage
```

## Tests Couverts

### Création de Funnel
- ✅ Créer un funnel avec template
- ✅ Validation des champs requis
- ✅ Redirection vers builder après création

### Soumission Publique
- ✅ Remplir et soumettre un formulaire
- ✅ Validation côté client
- ✅ Redirection vers thank you page
- ✅ Support des variantes A/B/C

### Configuration Routage
- ✅ Ajouter une règle de routage
- ✅ Réordonner les priorités
- ✅ Sauvegarder les modifications

## Rapport de Tests

Après exécution, un rapport HTML est généré :

```bash
npx playwright show-report
```

## CI/CD

Pour GitHub Actions, ajouter `.github/workflows/test.yml` :

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

## Notes

- Les tests utilisent des données de test (test-e2e@example.com)
- Utiliser un projet Supabase dédié aux tests si possible
- Ne jamais lancer les tests sur la production !

---

**Pour plus d'infos**: https://playwright.dev/docs/intro


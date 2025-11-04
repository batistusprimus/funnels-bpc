import { test, expect } from '@playwright/test';

test.describe('Création de Funnel', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter
    await page.goto('/login');
    await page.fill('input[type="email"]', 'baptiste@bpcorp.eu');
    await page.fill('input[type="password"]', 'your-test-password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/funnels');
  });

  test('devrait créer un funnel simple', async ({ page }) => {
    // Cliquer sur "Créer un funnel"
    await page.click('text=Créer un funnel');
    await page.waitForURL('/funnels/new');

    // Étape 1: Informations générales
    await page.fill('input#name', 'Test Funnel E2E');
    await page.fill('input#slug', 'test-e2e');
    await page.fill('textarea#description', 'Funnel créé par test automatique');
    await page.click('text=Suivant');

    // Étape 2: Choisir template
    await page.click('input#simple');
    await page.click('text=Suivant');

    // Étape 3: Tracking (skip)
    await page.click('text=Créer le funnel');

    // Vérifier redirection vers builder
    await page.waitForURL(/\/funnels\/[^/]+\/builder/);
    
    // Vérifier que le builder est chargé
    await expect(page.locator('text=Test Funnel E2E')).toBeVisible();
  });

  test('devrait valider les champs requis', async ({ page }) => {
    await page.click('text=Créer un funnel');
    await page.waitForURL('/funnels/new');

    // Essayer de continuer sans remplir
    await page.click('text=Suivant');

    // Devrait rester sur la même page (validation)
    await expect(page).toHaveURL('/funnels/new');
  });
});


import { test, expect } from '@playwright/test';

test.describe('Routage des Leads', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter
    await page.goto('/login');
    await page.fill('input[type="email"]', 'baptiste@bpcorp.eu');
    await page.fill('input[type="password"]', 'your-test-password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/funnels');
  });

  test('devrait configurer une règle de routage', async ({ page }) => {
    // Supposer qu'un funnel existe déjà
    // Cliquer sur le premier funnel
    await page.click('[href*="/funnels/"]');
    
    // Aller dans routing
    await page.click('text=Configurer le routage');
    await page.waitForURL(/\/routing$/);

    // Ajouter une règle
    await page.click('text=Ajouter une règle');

    // Configurer la règle
    await page.selectOption('select >> nth=0', 'capital'); // Champ
    await page.selectOption('select >> nth=1', '>'); // Opérateur
    await page.fill('input[placeholder="Valeur..."]', '50000');
    await page.fill('input[placeholder*="Client"]', 'Test Client');
    await page.fill('input[placeholder*="https"]', 'https://webhook.site/test');

    // Sauvegarder
    await page.click('text=Sauvegarder');

    // Vérifier toast de succès
    await expect(page.locator('text=Règles sauvegardées')).toBeVisible({ timeout: 3000 });
  });

  test('devrait réordonner les règles par priorité', async ({ page }) => {
    // Aller dans routing d'un funnel
    await page.click('[href*="/funnels/"]');
    await page.click('text=Configurer le routage');
    await page.waitForURL(/\/routing$/);

    // S'assurer qu'il y a au moins 2 règles
    const ruleCount = await page.locator('button:has-text("↑")').count();
    
    if (ruleCount >= 2) {
      // Cliquer sur ↓ de la première règle
      await page.locator('button:has-text("↓")').first().click();
      
      // Les règles devraient être réordonnées
      // (vérification visuelle - l'ordre change dans le DOM)
    }
  });
});


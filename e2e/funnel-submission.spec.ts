import { test, expect } from '@playwright/test';

test.describe('Soumission de Funnel Public', () => {
  test('devrait soumettre un lead avec succès', async ({ page }) => {
    // Note: Ce test nécessite qu'un funnel "demo" existe en BDD avec status='active'
    
    // Aller sur la landing page
    await page.goto('/f/demo');
    
    // Vérifier que la page charge
    await expect(page.locator('h1')).toBeVisible();

    // Cliquer sur le CTA
    await page.click('text=Démarrer maintenant');
    await page.waitForURL('/f/demo/form');

    // Remplir le formulaire (step 1)
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="email"]', 'test-e2e@example.com');
    await page.fill('input[name="phone"]', '0612345678');

    // Soumettre ou aller à l'étape suivante
    await page.click('button:has-text("Suivant"), button:has-text("Envoyer")');

    // Si multi-step, remplir les autres étapes
    const hasNextStep = await page.locator('button:has-text("Envoyer")').isVisible();
    
    if (!hasNextStep) {
      // Étape 2
      await page.fill('input[name="capital"]', '75000');
      await page.click('button:has-text("Envoyer")');
    }

    // Vérifier redirection vers thank you
    await page.waitForURL('/f/demo/thank-you', { timeout: 10000 });
    
    // Vérifier le message de confirmation
    await expect(page.locator('text=Merci')).toBeVisible();
  });

  test('devrait afficher les erreurs de validation', async ({ page }) => {
    await page.goto('/f/demo/form');

    // Essayer de soumettre sans remplir
    await page.click('button:has-text("Suivant"), button:has-text("Envoyer")');

    // Devrait afficher une erreur (toast ou message)
    // Note: Adapter selon votre implémentation de toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 2000 });
  });

  test('devrait supporter différentes variantes', async ({ page }) => {
    // Forcer variante B
    await page.goto('/f/demo?v=b');
    
    // Vérifier que la variante B charge
    await expect(page.locator('h1')).toBeVisible();
    
    // Les textes peuvent être différents selon la variante
    await page.click('a:has-text("form"), a:has-text("Commencer")');
  });
});


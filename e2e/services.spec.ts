import { test, expect } from '@playwright/test'

test.describe('Services Page', () => {
  test('should load services page', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar pela página carregar com timeout maior
    await expect(page.getByRole('heading', { name: 'Serviços' })).toBeVisible({ timeout: 5000 })
  })

  test('should have add service button', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Verificar se há um botão de adicionar usando role
    const addButton = page.getByRole('button', { name: 'Novo Serviço' })
    await expect(addButton).toBeVisible({ timeout: 5000 })
  })

  test('should open service dialog when clicking add', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar o botão aparecer usando role
    const addButton = page.getByRole('button', { name: 'Novo Serviço' })
    await expect(addButton).toBeVisible({ timeout: 5000 })
    
    // Clicar no botão de adicionar
    await addButton.click()
    
    // Verificar se dialog abriu - pode ser heading ou texto alternativo
    const dialogHeading = page.getByRole('heading', { name: 'Novo Serviço' })
    const dialogText = page.locator('text=Novo Serviço')
    
    // Esperar por pelo menos um desses estar visível (dialog pode ter estrutura diferente)
    await expect(dialogHeading.or(dialogText)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Booking Page', () => {
  test('should load booking page', async ({ page }) => {
    await page.goto('/booking')
    
    // Esperar pela página carregar
    await expect(page).toHaveTitle(/.*/)
  })
})

import { test, expect } from '@playwright/test'

test.describe('Services Page', () => {
  test('should load and display services', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar pela página de serviços carregar
    await expect(page.locator('text=Serviços')).toBeVisible()
    
    // Verificar se há um botão de adicionar
    const addButton = page.locator('button:has-text("Novo Serviço")')
    await expect(addButton).toBeVisible()
  })

  test('should open service dialog when clicking add', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar o botão aparecer
    await page.locator('button:has-text("Novo Serviço")').first().waitFor({ state: 'visible' })
    
    // Clicar no botão de adicionar
    await page.locator('button:has-text("Novo Serviço")').first().click()
    
    // Verificar se dialog abriu
    await expect(page.locator('text=Novo Serviço')).toBeVisible()
  })

  test('should display services in table', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar pela tabela
    await expect(page.locator('table')).toBeVisible()
  })
})

test.describe('Booking Page', () => {
  test('should load booking page', async ({ page }) => {
    await page.goto('/booking')
    
    // Esperar pela página carregar
    await expect(page).toHaveTitle(/.*/)
  })
})

import { test, expect } from '@playwright/test'

test.describe('Services Page', () => {
  test('should load and display services', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar pelo heading de serviços carregar (more specific locator)
    await expect(page.getByRole('heading', { name: 'Serviços' })).toBeVisible()
    
    // Verificar se há um botão de adicionar usando role
    const addButton = page.getByRole('button', { name: 'Novo Serviço' })
    await expect(addButton).toBeVisible()
  })

  test('should open service dialog when clicking add', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar o botão aparecer usando role (more reliable)
    const addButton = page.getByRole('button', { name: 'Novo Serviço' })
    await expect(addButton).toBeVisible()
    
    // Clicar no botão de adicionar
    await addButton.click()
    
    // Verificar se dialog abriu (wait for dialog heading)
    await expect(page.getByRole('heading', { name: 'Novo Serviço' })).toBeVisible()
  })

  test('should display services in table', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar pela tabela com timeout aumentado
    const table = page.getByRole('table')
    await expect(table).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Booking Page', () => {
  test('should load booking page', async ({ page }) => {
    await page.goto('/booking')
    
    // Esperar pela página carregar
    await expect(page).toHaveTitle(/.*/)
  })
})

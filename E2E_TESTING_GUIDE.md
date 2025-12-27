# E2E Testing Guide

## 🔐 Environment Variables Required

E2E tests require valid Supabase credentials to run in CI/CD. The following secrets must be configured in your GitHub repository:

### GitHub Secrets Configuration

Go to: **Settings → Secrets and variables → Actions**

Add these secrets:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Where to find these values:

1. Go to https://supabase.com and log in to your project
2. Navigate to **Project Settings → API**
3. Copy the values for:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → Use as `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 🧪 Running E2E Tests Locally

### Prerequisites
```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install
```

### Run tests
```bash
# Run all E2E tests
npm run e2e

# Run with UI mode (recommended for debugging)
npm run e2e:ui

# Run in debug mode
npm run e2e:debug

# Run specific test file
npx playwright test e2e/services.spec.ts

# Run single test
npx playwright test -g "should load services page"
```

## 📋 Test Coverage

Currently testing:

### Services Page (`e2e/services.spec.ts`)
- ✅ Page loads and renders "Serviços" heading
- ✅ "Novo Serviço" button is visible
- ✅ Dialog opens when clicking "Novo Serviço" button

### Booking Page (`e2e/services.spec.ts`)
- ✅ Page loads with valid title

## 🚀 Running in CI/CD

The `.github/workflows/e2e.yml` workflow:

1. Installs dependencies
2. Installs Playwright browsers
3. Builds the Next.js project
4. Starts the development server
5. Waits for server readiness
6. Runs E2E tests
7. Uploads test results

### What happens if Supabase credentials are missing?

```
Error: getaddrinfo ENOTFOUND bgbftqpfxbjtkqhdkigf.supabase.co
```

This means the Supabase URL in environment variables is invalid or unreachable. 

**Solution:** Update GitHub Secrets with valid Supabase credentials.

## 📚 Playwright Best Practices Used

### Locator Strategy
- Use semantic locators: `getByRole()` over generic `locator()`
- More resilient to UI changes
- Better accessibility alignment

Example:
```typescript
// ✅ Good
await expect(page.getByRole('button', { name: 'Novo Serviço' })).toBeVisible()

// ❌ Avoid
await expect(page.locator('button:has-text("Novo Serviço")')).toBeVisible()
```

### Timeouts
- Default: 30 seconds (Playwright default)
- Custom: Set explicitly for slow operations
- Example: `{ timeout: 5000 }` for 5 seconds

### Waiting Strategies
- Let Playwright wait automatically (recommended)
- Use `waitFor()` only when needed
- Avoid `sleep()` or hardcoded delays

## 🔍 Debugging Failed Tests

### 1. View test traces
```bash
npx playwright show-trace trace.zip
```

### 2. Screenshot on failure
Tests automatically capture screenshots when they fail (saved in `test-results/`)

### 3. Run with verbose output
```bash
npx playwright test --debug
```

### 4. Check Lighthouse reports
E2E workflow also generates Lighthouse reports for performance metrics.

## 📊 CI/CD Status

Check test results at: **Actions → E2E Tests workflow**

Each run shows:
- ✅ Test results
- 📊 Duration
- 📸 Screenshots of failures
- 📋 Full logs

---

**Last Updated**: December 26, 2025

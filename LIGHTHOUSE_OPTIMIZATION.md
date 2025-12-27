# Lighthouse Performance Optimization Guide

## � Critical Issues Identified

These are the specific issues causing Lighthouse failures:

1. **Button Accessible Names** - Buttons without aria-label or visible text
2. **Color Contrast** - Text doesn't meet WCAG AA standards (4.5:1 ratio)
3. **Performance Metrics** - Slow First Contentful Paint, Largest Contentful Paint
4. **Render-Blocking Resources** - CSS/JS files blocking initial page load

## 📋 Quick Action Plan

### Immediate (Today)
- [ ] Find all buttons in components and audit for missing labels
- [ ] Check color combinations in critical UI elements
- [ ] Run Lighthouse locally to identify specific failing elements

### Short Term (This Week)
- [ ] Add aria-labels to all icon buttons
- [ ] Update color palette for better contrast
- [ ] Implement image optimization

### Medium Term (Next 2-4 Weeks)
- [ ] Defer non-critical CSS/JS
- [ ] Implement code splitting
- [ ] Optimize font loading

## �📊 Current Status

Lighthouse CI is running in development mode with relaxed thresholds and disabled problematic audits:

| Category | Current Threshold | Long-term Target | Severity |
|----------|------------------|------------------|----------|
| Performance | 0.5 (warn) | 0.8 (error) | High |
| Accessibility | 0.5 (warn) | 0.9 (error) | Medium |
| Best Practices | 0.5 (warn) | 0.8 (error) | Medium |
| SEO | 0.5 (warn) | 0.8 (error) | Low |

**Disabled Audits (temporarily):**
- `button-name` - Will fix button accessibility systematically
- `color-contrast` - Will audit and fix color contrasts
- `largest-contentful-paint` - Will optimize image loading
- `cumulative-layout-shift` - Will stabilize layouts
- `first-contentful-paint` - Will optimize initial paint

## 🔍 Files to Audit & Fix

### High Priority - Buttons Without Labels
Search for these patterns in your components:
```bash
# Find buttons that might be missing labels
grep -r "<button" app/ components/ | grep -v "aria-label" | grep -v ">{.*}</button"
```

Likely files to check:
- `components/ui/button.tsx` - Base button component
- `app/private/servicos/_components/` - Services page buttons
- `app/private/clientes/_components/` - Clients page buttons
- `components/menu-sheet.tsx` - Navigation buttons

### High Priority - Color Contrast
Check these components for contrast issues:
- `components/ui/*.tsx` - All UI components
- Global styles affecting text color
- Theme/color configuration files

### Medium Priority - Performance
Files affecting page load:
- `app/layout.tsx` - Root layout with critical assets
- `next.config.ts` - Build and optimization config
- Any components with large dependencies

## 🎯 Identified Issues & Solutions

### 1. Performance Optimization (Priority: HIGH)

**Current Issue**: Speed Index ~0.28, need >= 0.5-0.8

#### Solutions to implement:
- [ ] **Code Splitting**: Break up large JavaScript bundles
  ```typescript
  // Use dynamic imports for route-based code splitting
  const ServicesPage = dynamic(() => import('@/app/private/servicos/_components/services-page-client'), {
    loading: () => <LoadingSpinner />,
    ssr: true
  })
  ```

- [ ] **Image Optimization**: Use Next.js Image component
  ```tsx
  import Image from 'next/image'
  
  <Image
    src="/logo.png"
    alt="Logo"
    width={200}
    height={100}
    priority  // Only for above-the-fold images
  />
  ```

- [ ] **CSS Optimization**:
  - Extract critical CSS for above-the-fold content
  - Defer non-critical CSS with media queries
  - Remove unused styles with PurgeCSS/Tailwind

- [ ] **Third-Party Scripts**:
  - Audit all external scripts (analytics, tracking, etc.)
  - Load with `async` or `defer` attributes
  - Consider moving to `<head>` with appropriate loading strategy

- [ ] **Font Optimization**:
  ```tsx
  // In layout.tsx
  import localFont from 'next/font/local'
  
  const roboto = localFont({
    src: './fonts/roboto.woff2',
    display: 'swap'  // Shows fallback font immediately
  })
  ```

### 2. Accessibility Improvements (Priority: MEDIUM)

**Current Issue**: Buttons without accessible names

#### Solutions:
- [ ] **Audit all buttons**:
  ```tsx
  // ❌ Bad
  <button><IconComponent /></button>
  
  // ✅ Good
  <button aria-label="Add new service">
    <IconComponent />
  </button>
  
  // ✅ Also good
  <button>Add Service</button>
  ```

- [ ] **Semantic HTML**:
  ```tsx
  // Use proper semantic elements
  <button>Action</button>        // Not <div onClick>
  <nav>Navigation</nav>          // Not <div class="nav">
  <main>Content</main>          // Not <div class="main">
  <article>Post</article>       // Not <div class="post">
  ```

- [ ] **ARIA Labels**: Add for all interactive elements
  ```tsx
  <button aria-label="Close menu">✕</button>
  <input aria-label="Search services" placeholder="..." />
  <div role="alert">Error message</div>
  ```

- [ ] **Color Contrast**: Ensure 4.5:1 ratio for text
  - Use tools: WebAIM Contrast Checker
  - Test with: devtools Lighthouse audit

### 3. Render-Blocking Resources (Priority: HIGH)

**Current Issue**: CSS/JS blocks First Contentful Paint

#### Solutions:
- [ ] **Defer Non-Critical CSS**:
  ```html
  <!-- Critical CSS inline in head -->
  <style>
    /* Only critical above-the-fold styles */
  </style>
  
  <!-- Defer non-critical -->
  <link rel="preload" href="/styles/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/non-critical.css"></noscript>
  ```

- [ ] **Async/Defer JavaScript**:
  ```html
  <!-- Defer non-critical scripts -->
  <script src="analytics.js" defer></script>
  
  <!-- Async for truly independent scripts -->
  <script src="tracking.js" async></script>
  ```

### 4. SEO Improvements (Priority: LOW)

- [ ] **Meta Tags**: Add proper Open Graph and Twitter Card tags
- [ ] **Robots.txt**: Create `/public/robots.txt`
- [ ] **Sitemap**: Create `/public/sitemap.xml`
- [ ] **Structured Data**: Add JSON-LD for rich snippets

## 🔧 Incremental Improvement Plan

### Phase 1 (1-2 weeks)
- Implement dynamic imports for heavy routes
- Add Image optimization
- Fix accessibility issues (buttons)

### Phase 2 (2-4 weeks)
- Optimize CSS delivery
- Audit and defer third-party scripts
- Improve font loading strategy

### Phase 3 (1 month+)
- Further code splitting
- CDN integration for assets
- Consider service workers for caching

## 📈 Progress Tracking

Update these thresholds as you improve:

```json
{
  "assert": {
    "assertions": {
      "categories:performance": ["warn", { "minScore": 0.5 }],    // → 0.6 → 0.7 → 0.8
      "categories:accessibility": ["warn", { "minScore": 0.7 }],  // → 0.8 → 0.9
      "categories:best-practices": ["warn", { "minScore": 0.6 }], // → 0.7 → 0.8
      "categories:seo": ["warn", { "minScore": 0.6 }]             // → 0.7 → 0.8
    }
  }
}
```

## 🔍 Tools & Resources

- **Local Testing**: `npm run build && npm run start` then run Lighthouse in DevTools
- **Detailed Reports**: Check the temporary public storage URLs from CI logs
- **Automation**: 
  - Use `npm run test:lighthouse` locally before pushing
  - Set up pre-commit hooks to catch issues early

## 📝 Reference Files

- Configuration: `lighthouserc.json`
- Lighthouse Config: `lighthouse-config.js`
- Workflow: `.github/workflows/lighthouse.yml`
- Check detailed reports at: `https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/`

---

**Note**: Thresholds use "warn" severity to allow CI to pass while logging issues. Gradually upgrade to "error" as scores improve.

**Last Updated**: December 26, 2025

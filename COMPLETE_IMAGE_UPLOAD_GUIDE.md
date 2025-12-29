# Complete Image Upload Features Summary

## Overview
Sistema completo de upload de imagens implementado para três tipos de entidades:
1. **Produtos** - Com exibição em catálogos
2. **Serviços** - Com exibição em listagem
3. **Funcionários** - Com exibição em listagem

## Reusable Components

### ProductImageUploader Component
**Localização:** `app/private/produtos/_components/product-image-uploader.tsx`

**Props:**
```typescript
{
  onUpload: (url: string) => void      // Callback quando upload é concluído
  currentImage?: string | null          // URL da imagem atual (para preview)
  itemName: string                      // Nome do item (para contexto)
  itemType: 'product' | 'service' | 'professional'  // Tipo para pasta no storage
}
```

**Features:**
- Drag-and-drop ou clique para selecionar
- Preview da imagem antes de upload
- Indicador de carregamento
- Validação de tamanho (5MB max)
- Aceita todos os tipos de arquivo
- Mostra erro em caso de falha
- Componente condicionado (só exibe se `itemName` está preenchido)

### Upload API Endpoint
**Localização:** `app/api/upload-image/route.ts`

**Request:**
```
POST /api/upload-image
Body: FormData
  - file: File
  - itemType: 'product' | 'service' | 'professional'
  - itemName: string (usado para nomear o arquivo)
```

**Response:**
```json
{
  "url": "https://your-bucket.supabase.co/storage/v1/object/public/images/..."
}
```

**Storage Organization:**
- `images/products/{fileName}`
- `images/services/{fileName}`
- `images/professional/{fileName}`

## Implementation per Entity Type

### 1. PRODUCTS 🏪
**Files Modified:**
- `app/private/produtos/_components/product-dialog.tsx` - Added image upload
- `app/private/produtos/_components/products-catalog-client.tsx` - Added image column
- `app/api/catalogs/route.ts` - Updated to include product images
- **Migration:** `migrations/add_image_url_to_products.sql`

**Features:**
- Upload ao criar/editar produto
- Imagem aparece em catálogos quando selecionado
- Thumbnail 40x40px na listagem de produtos
- Integrado com API de catálogos

### 2. SERVICES 🧹
**Files Modified:**
- `app/private/servicos/_components/service-dialog.tsx` - Added image upload
- `app/private/servicos/_components/services-page-client.tsx` - Added image column
- **Migration:** `migrations/add_image_url_to_services.sql`

**Features:**
- Upload ao criar/editar serviço
- Thumbnail 40x40px na listagem de serviços
- Upload condicional (aparece quando nome preenchido)

### 3. EMPLOYEES 👥
**Files Modified:**
- `app/private/funcionarios/_components/employee-dialog.tsx` - Added image upload
- `app/private/funcionarios/_components/employees-page-client.tsx` - Added image column
- `app/api/employees/route.ts` - Updated to include image_url
- **Migration:** `migrations/add_image_url_to_employees.sql`

**Features:**
- Upload ao criar/editar funcionário
- Thumbnail 40x40px na listagem de funcionários
- Upload condicional (aparece quando nome preenchido)
- API retorna image_url para listagem pública

## Database Schema

All tables follow the same pattern:

```sql
-- Products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX idx_products_image_url ON public.products(image_url);

-- Services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX idx_services_image_url ON public.services(image_url);

-- Employees table
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX idx_employees_image_url ON public.employees(image_url);

-- Catalogs/Products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX idx_products_image_url ON public.products(image_url);
```

## UI Patterns

### Dialog Upload (Products, Services, Employees)
```tsx
{/* Upload field appears after name is filled */}
{formData.name && (
  <div>
    <Label>Foto/Imagem</Label>
    <ProductImageUploader 
      onUpload={(url) => setFormData({ ...formData, image_url: url })}
      currentImage={formData.image_url}
      itemName={formData.name}
      itemType="product|service|professional"
    />
  </div>
)}
```

### Table Display
```tsx
<TableHead className="w-12">Foto/Imagem</TableHead>

{/* In TableBody */}
<TableCell className="w-12">
  {item.image_url ? (
    <Image
      src={item.image_url}
      alt={item.name}
      width={40}
      height={40}
      className="w-10 h-10 rounded-md object-cover"
    />
  ) : (
    <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
      -
    </div>
  )}
</TableCell>
```

## File Structure

```
app/
├── api/
│   ├── upload-image/route.ts          [NEW] Generic upload endpoint
│   ├── catalogs/route.ts              [UPDATED] Include product images
│   └── employees/route.ts             [UPDATED] Include image_url
├── private/
│   ├── catalogos/
│   │   └── _components/
│   │       ├── image-uploader.tsx     [UPDATED] Accept all types
│   │       └── catalog-page-client.tsx
│   ├── produtos/
│   │   └── _components/
│   │       ├── product-image-uploader.tsx [NEW] Reusable uploader
│   │       ├── product-dialog.tsx     [UPDATED]
│   │       └── products-catalog-client.tsx [UPDATED]
│   ├── servicos/
│   │   └── _components/
│   │       ├── service-dialog.tsx     [UPDATED]
│   │       └── services-page-client.tsx [UPDATED]
│   └── funcionarios/
│       └── _components/
│           ├── employee-dialog.tsx    [UPDATED]
│           └── employees-page-client.tsx [UPDATED]

migrations/
├── add_image_url_to_products.sql      [NEW]
├── add_image_url_to_services.sql      [NEW]
└── add_image_url_to_employees.sql     [NEW]
```

## Execution Checklist

### 1. Database Migrations (Supabase SQL Editor)
- [ ] Execute `migrations/add_image_url_to_products.sql`
- [ ] Execute `migrations/add_image_url_to_services.sql`
- [ ] Execute `migrations/add_image_url_to_employees.sql`

### 2. Testing
- [ ] Create product with image → see in product list & catalog
- [ ] Create service with image → see in service list
- [ ] Create employee with image → see in employee list
- [ ] Edit items and change images
- [ ] Test image upload > 5MB (should fail)
- [ ] Test different image formats

### 3. Deployment
- [ ] Push changes to repo
- [ ] Deploy to production
- [ ] Run migrations in production Supabase
- [ ] Verify storage bucket permissions
- [ ] Test upload functionality

## Standards Applied

✅ **Code Quality:**
- Consistent naming across entities
- Reusable components (no duplication)
- Type-safe with TypeScript
- Proper error handling

✅ **UX:**
- Conditional upload (appears after required fields)
- Clear visual feedback
- Consistent styling
- Fallback placeholders

✅ **Performance:**
- Next.js Image optimization
- Lazy loading
- Indexed database columns
- Efficient API queries

✅ **Security:**
- File size validation (5MB)
- Filename sanitization
- Public storage with proper permissions
- Type-safe requests

## Notes
- All three features follow the exact same pattern for consistency
- `ProductImageUploader` is generic enough to be reused for other entities
- Upload endpoint is flexible with `itemType` parameter
- Can easily extend to other entities (appointments, customers, etc.)

## Future Improvements
- [ ] Batch upload for products
- [ ] Image cropping before upload
- [ ] Image compression
- [ ] Gallery view for products
- [ ] Image search/filtering
- [ ] Default placeholder images
- [ ] CDN caching optimization

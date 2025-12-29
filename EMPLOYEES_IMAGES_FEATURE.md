# Employee Images Feature

## Overview
Adicionado suporte completo para upload e exibição de fotos de funcionários em todo o sistema.

## Components Modified

### 1. **employee-dialog.tsx**
- Adicionado import do `ProductImageUploader`
- Adicionado campo `image_url?: string | null` ao tipo `Employee`
- Adicionado `image_url` ao estado `formData`
- Adicionado `image_url` ao payload de save
- Adicionado campo visual de upload de imagem (aparece quando nome é preenchido)
- O upload está localizado entre Departamento e Data de Admissão

### 2. **employees-page-client.tsx**
- Adicionado import do `Image` do Next.js
- Adicionado campo `image_url?: string | null` ao tipo `Employee`
- Adicionada coluna "Foto" na tabela (primeira coluna, w-12)
- A coluna exibe thumbnail de 40x40px ou placeholder cinza

### 3. **app/api/employees/route.ts**
- Atualizado SELECT para incluir `image_url`
- Agora retorna a URL da imagem quando listando funcionários ativos

## Database
### Migration: `migrations/add_image_url_to_employees.sql`
```sql
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX idx_employees_image_url ON public.employees(image_url);
```

## Storage
- Imagens armazenadas em: `images/professional/`
- Formato: `images/professional/{id-time-random}.{ext}`
- Limite de tamanho: 5MB
- Tipos aceitos: Todos (sem restrição)

## Implementation Details

### Upload Flow
1. Usuário preenche o nome do funcionário
2. Campo de upload aparece automaticamente
3. Usuário faz drag-drop ou seleciona arquivo
4. Imagem é enviada para `/api/upload-image` com `itemType=professional`
5. URL pública é retornada e salva no campo `image_url`

### Display
- Listagem: Thumbnail de 40x40px com border-radius
- Falback: Placeholder cinza com "-"
- Qualidade: Otimizada via Next.js Image component

## Features Completed ✅
- ✅ Upload de imagem em dialog de novo funcionário
- ✅ Upload de imagem em dialog de edição
- ✅ Display de thumbnail na listagem
- ✅ API atualizada para incluir imagens
- ✅ Reuso de componente genérico `ProductImageUploader`
- ✅ Mesmos padrões de validação e segurança dos produtos e serviços

## Testing Checklist
- [ ] Criar novo funcionário com foto
- [ ] Editar funcionário e adicionar/alterar foto
- [ ] Verificar thumbnail na listagem
- [ ] Verificar resolução de imagem em diferentes tamanhos
- [ ] Tentar upload de arquivo grande (>5MB) - deve rejeitar
- [ ] Verificar API /api/employees retorna image_url

## Notes
- Componente `ProductImageUploader` é reutilizável para qualquer tipo de entidade
- Todos os três tipos (products, services, employees) usam o mesmo endpoint `/api/upload-image`
- Migrações do banco ainda precisam ser executadas no Supabase

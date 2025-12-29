# Upload de Imagens em Produtos - Implementação Concluída

## O que foi implementado

Adicionei suporte completo para upload de imagens em produtos do estoque. Agora você pode:

1. **Fazer upload de imagens ao criar/editar produtos**
2. **Visualizar thumbnails das imagens na lista de produtos**
3. **Aceitar todos os tipos de imagem** (as mesmas características do upload de catálogos)

## Arquivos Criados

### 1. API de Upload Genérica
**Arquivo**: `app/api/upload-image/route.ts`
- Endpoint genérico para upload de imagens
- Funciona para produtos, serviços e profissionais
- Salva as imagens em pastas organizadas no Supabase Storage
- Retorna a URL pública da imagem

### 2. Componente de Upload de Imagem
**Arquivo**: `app/private/produtos/_components/product-image-uploader.tsx`
- Componente reutilizável para upload de imagens
- Interface drag-and-drop
- Aceita todos os tipos de imagem
- Máximo de 5MB por arquivo
- Preview em tempo real

## Arquivos Modificados

### 1. Dialog de Produtos
**Arquivo**: `app/private/produtos/_components/product-dialog.tsx`
- ✅ Adicionado tipo `image_url` ao tipo Product
- ✅ Adicionado campo `image_url` ao estado formData
- ✅ Adicionado componente `ProductImageUploader` no formulário
- ✅ Incluído `image_url` no payload ao salvar/atualizar produtos

### 2. Listagem de Produtos
**Arquivo**: `app/private/produtos/_components/products-catalog-client.tsx`
- ✅ Adicionado tipo `image_url` ao tipo Product
- ✅ Importado componente `Image` do Next.js
- ✅ Adicionada coluna de imagem na tabela de produtos
- ✅ Exibe thumbnail da imagem ou placeholder se não houver imagem

### 3. Migração do Banco de Dados
**Arquivo**: `migrations/add_image_url_to_products.sql`
- Adiciona coluna `image_url` na tabela products
- Cria índice para melhor performance

## Como Usar

### Ao criar um novo produto:
1. Preencha o nome do produto
2. Uma seção de upload de imagem aparecerá automaticamente
3. Clique para selecionar ou arraste a imagem
4. A imagem será enviada automaticamente
5. Clique em "Criar" para salvar o produto com a imagem

### Ao editar um produto:
1. Clique no botão editar (lápis)
2. O formulário será preenchido com os dados do produto
3. Você pode alterar a imagem na seção de upload
4. Clique em "Atualizar" para salvar as mudanças

### Na listagem de produtos:
- Você verá uma coluna com a imagem thumbnail de cada produto
- Se não houver imagem, um placeholder cinza será exibido

## Requisitos

### Banco de Dados
Execute a migração em `migrations/add_image_url_to_products.sql` no seu Supabase:

```sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_products_image_url ON public.products(image_url);
```

### Supabase Storage
- Certifique-se de que o bucket "images" existe
- O bucket deve ter acesso público habilitado
- As imagens serão salvas em: `images/product/[nome-sanitizado]-[timestamp].[extensão]`

## Especificações Técnicas

- **Tamanho máximo**: 5MB por imagem
- **Formatos aceitos**: Todos os tipos de imagem
- **Armazenamento**: Supabase Storage (bucket: images)
- **Estrutura**: `images/products/`
- **URL pública**: Gerada automaticamente pelo Supabase

## Notas Importantes

1. O upload de imagem é **opcional** ao criar/editar produtos
2. As imagens são armazenadas no Supabase Storage e acessadas via URLs públicas
3. Todos os tipos de imagem são aceitos (PNG, JPG, WebP, GIF, etc.)
4. O componente `ProductImageUploader` é reutilizável para serviços e profissionais também

## Próximos Passos (Opcional)

Se desejado, você pode implementar o mesmo para:
- **Serviços**: Adicionar upload de imagem na página de serviços
- **Profissionais**: Adicionar upload de imagem na página de profissionais
- **Produtos em Catálogos**: Melhorar a exibição com as imagens dos produtos

---

**Status**: ✅ Implementação concluída e pronta para uso!

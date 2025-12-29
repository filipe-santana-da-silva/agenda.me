# Upload de Imagens em Serviços - Implementação Concluída

## O que foi implementado

Adicionei suporte completo para upload de imagens em serviços. Agora você pode:

1. **Fazer upload de imagens ao criar/editar serviços**
2. **Visualizar thumbnails das imagens na lista de serviços**
3. **Aceitar todos os tipos de imagem**

## Arquivos Criados

### Migração do Banco de Dados
**Arquivo**: `migrations/add_image_url_to_services.sql`
- Adiciona coluna `image_url` na tabela services
- Cria índice para melhor performance

## Arquivos Modificados

### 1. Dialog de Serviços
**Arquivo**: `app/private/servicos/_components/service-dialog.tsx`
- ✅ Adicionado tipo `image_url` ao tipo Service
- ✅ Adicionado campo `image_url` ao estado formData
- ✅ Adicionado componente `ProductImageUploader` no formulário
- ✅ Incluído `image_url` no payload ao salvar/atualizar serviços

### 2. Listagem de Serviços
**Arquivo**: `app/private/servicos/_components/services-page-client.tsx`
- ✅ Adicionado tipo `image_url` ao tipo Service
- ✅ Importado componente `Image` do Next.js
- ✅ Adicionada coluna de imagem na tabela de serviços
- ✅ Exibe thumbnail da imagem ou placeholder se não houver imagem

## Como Usar

### Ao criar um novo serviço:
1. Preencha o nome do serviço
2. Configure a duração e preço
3. Uma seção de upload de imagem aparecerá automaticamente após preencher o nome
4. Clique para selecionar ou arraste a imagem
5. A imagem será enviada automaticamente
6. Clique em "Criar" para salvar o serviço com a imagem

### Ao editar um serviço:
1. Clique no botão editar (lápis)
2. O formulário será preenchido com os dados do serviço
3. Você pode alterar a imagem na seção de upload
4. Clique em "Atualizar" para salvar as mudanças

### Na listagem de serviços:
- Você verá uma coluna com a imagem thumbnail de cada serviço
- Se não houver imagem, um placeholder cinza será exibido

## Requisitos

### Banco de Dados
Execute a migração em `migrations/add_image_url_to_services.sql` no seu Supabase:

```sql
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_services_image_url ON public.services(image_url);
```

### Supabase Storage
- Certifique-se de que o bucket "images" existe
- O bucket deve ter acesso público habilitado
- As imagens serão salvas em: `images/services/[nome-sanitizado]-[timestamp].[extensão]`

## Especificações Técnicas

- **Tamanho máximo**: 5MB por imagem
- **Formatos aceitos**: Todos os tipos de imagem
- **Armazenamento**: Supabase Storage (bucket: images)
- **Estrutura**: `images/services/`
- **URL pública**: Gerada automaticamente pelo Supabase

## Notas Importantes

1. O upload de imagem é **opcional** ao criar/editar serviços
2. As imagens são armazenadas no Supabase Storage e acessadas via URLs públicas
3. Todos os tipos de imagem são aceitos (PNG, JPG, WebP, GIF, etc.)
4. O componente `ProductImageUploader` é reutilizável para qualquer tipo de item

---

**Status**: ✅ Implementação concluída e pronta para uso!

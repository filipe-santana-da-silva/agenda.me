# 🖼️ Configuração do Carrosel de Login

## Imagens Necessárias

Para o carrosel funcionar corretamente, você precisa adicionar 3 imagens na pasta `public/`:

### Imagens Requeridas:

1. **`/public/carousel-1.jpg`** - Primeira imagem do carrosel
2. **`/public/carousel-2.jpg`** - Segunda imagem do carrosel
3. **`/public/carousel-3.jpg`** - Terceira imagem do carrosel

### Especificações Recomendadas:

- **Formato**: JPG, PNG ou WebP
- **Resolução**: 1920 x 1080px (Full HD) ou superior
- **Aspecto**: 16:9
- **Tamanho**: Menos de 500KB cada (para performance)
- **Conteúdo**: Imagens representativas da clínica/negócio

### Como Adicionar as Imagens:

1. **Prepare as imagens** em seu computador
2. **Navegue até**: `public/` na raiz do projeto
3. **Copie as 3 imagens** para lá
4. **Nomeie conforme**: `carousel-1.jpg`, `carousel-2.jpg`, `carousel-3.jpg`
5. **Reinicie o servidor** (se necessário)

### Estrutura de Pastas:

```
projeto/
├── public/
│   ├── logo.png
│   ├── carousel-1.jpg  ← Adicionar
│   ├── carousel-2.jpg  ← Adicionar
│   ├── carousel-3.jpg  ← Adicionar
│   └── ... outras imagens
├── app/
├── components/
└── ...
```

## ✨ Funcionalidades do Carrosel

- ✅ Exibe 3 imagens em sequência
- ✅ Muda a cada 5 segundos automaticamente
- ✅ Transição suave com fade in/out
- ✅ Indicadores de slide clicáveis
- ✅ Responsivo (hidden em telas pequenas, visível em lg+)
- ✅ Prioridade de carregamento na primeira imagem

## 🎯 Comportamento

1. **Rotação**: As imagens trocam automaticamente a cada 5 segundos
2. **Loop**: Após a última imagem, volta para a primeira
3. **Indicadores**: Pontinhos na parte inferior mostram qual slide está ativo
4. **Clicáveis**: Você pode clicar em um ponto para ir direto àquele slide

## 📱 Responsividade

- **Mobile/Tablet**: Carrosel não aparece (apenas formulário de login)
- **Desktop (lg+)**: Carrosel aparece no lado esquerdo

## 🔧 Customização

Se quiser alterar o tempo de troca:

Abra `app/(auth)/login/page.tsx` e procure por:
```tsx
setCurrentSlide((prev) => (prev + 1) % slides.length)
}, 5000)  // ← Tempo em milissegundos (5000 = 5 segundos)
```

Altere `5000` para o valor desejado:
- `3000` = 3 segundos
- `10000` = 10 segundos

## 📊 Imagens Sugeridas

Algumas ideias para as imagens:

1. **carousel-1.jpg**: Foto da recepção/entrada da clínica
2. **carousel-2.jpg**: Foto de um serviço sendo realizado
3. **carousel-3.jpg**: Foto de satisfação/cliente feliz

## ⚠️ Se as Imagens Não Aparecerem

1. **Verifique os nomes**: Exatamente `carousel-1.jpg`, `carousel-2.jpg`, `carousel-3.jpg`
2. **Verifique a pasta**: Devem estar em `public/`
3. **Reinicie o servidor**: `npm run dev`
4. **Limpe o cache**: `Ctrl+Shift+R` no navegador

## 🎨 Exemplo de Estrutura de Imagem

Se quiser criar imagens customizadas, use dimensões:
- **Largura**: 1920px
- **Altura**: 1080px
- **DPI**: 72 (para web)

Ferramentas recomendadas:
- Canva (canva.com)
- Photoshop
- GIMP (gratuito)
- Figma

## 📝 Notas

- As imagens são carregadas com `priority` na primeira para melhor performance
- Usa transição CSS `duration-1000` (1 segundo) para suavidade
- Indicadores são clicáveis e respondem ao hover
- Perfeitamente responsivo e acessível

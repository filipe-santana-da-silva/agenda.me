#!/bin/bash

echo "🔧 Iniciando correção de erros de linting..."
echo "================================================"

# Rodar ESLint com --fix para correção automática
echo "1️⃣  Corrigindo erros automáticos com ESLint..."
npx eslint . --fix --max-warnings 100

# Rodar ESLint novamente para ver quantos erros restam
echo ""
echo "2️⃣  Verificando status pós-correção..."
RESULT=$(npx eslint . --format json 2>/dev/null || true)

# Contar erros e warnings
ERRORS=$(echo "$RESULT" | grep -o '"ruleId"' | wc -l)

if [ $ERRORS -eq 0 ]; then
  echo "✅ Todos os erros foram corrigidos!"
else
  echo "⚠️  Ainda existem $ERRORS problemas para revisar manualmente"
  echo ""
  echo "3️⃣  Principais arquivos com erros:"
  npx eslint . --format json 2>/dev/null | grep '"filePath"' | sort | uniq | head -20
fi

echo ""
echo "✅ Script de correção finalizado!"
echo "================================================"
echo ""
echo "📝 Dicas:"
echo "  - Revise os erros restantes manualmente"
echo "  - Para 'any' types, especifique tipos corretos"
echo "  - Para imports não utilizados, remova-os"
echo "  - Para React Hooks, verifique as dependências"

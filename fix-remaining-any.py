#!/usr/bin/env python3
"""Corrigir padrões de `any` não cobertos pela primeira passagem"""

import re
import glob

def fix_remaining_any_patterns(filepath):
    """Tenta corrigir tipos 'any' restantes"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Padrão: ... as any[] ... para ... as Array<Record<string, unknown>> ...
        content = re.sub(r'as\s+any\[\]', r'as Array<Record<string, unknown>>', content)
        
        # Padrão: await ... as any para ... as Record<string, unknown>
        content = re.sub(r'as\s+any\s+\|', r'as Record<string, unknown> |', content)
        
        # Padrão: const x = y as any; para const x = y as Record<string, unknown>;
        content = re.sub(r'as\s+any\s*;', r'as Record<string, unknown>;', content)
        
        # Padrão: export async function POST(request: Request) { const body = await request.json() const data = body as any
        # para ... as Record<string, unknown>
        content = re.sub(r':\s*any\s*;', r': Record<string, unknown>;', content)
        
        # Padrão para variáveis: const rows: any[] = ...
        content = re.sub(r':\s*any\[\]', r': Array<Record<string, unknown>>', content)
        
        # Padrão simples: ` as any` ao final
        content = re.sub(r'\s+as\s+any(\s+[;}])', r' as Record<string, unknown>\1', content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Erro em {filepath}: {e}")
        return False

def main():
    patterns = ['**/*.ts', '**/*.tsx']
    fixed = 0
    for pattern in patterns:
        for filepath in glob.glob(pattern, recursive=True):
            if 'node_modules' in filepath or '.next' in filepath:
                continue
            if fix_remaining_any_patterns(filepath):
                print(f"✓ {filepath}")
                fixed += 1
    print(f"Total: {fixed}")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Script para corrigir automaticamente tipos 'any' em arquivos TypeScript/TSX"""

import re
import os
import glob

def fix_any_types_in_file(filepath):
    """Tenta corrigir tipos 'any' em um arquivo TypeScript"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Padrão 1: Parâmetros de função com any
        # (param: any) => ... para (param: Record<string, unknown>) => ...
        content = re.sub(r'\((\w+):\s*any\)', r'(\1: Record<string, unknown>)', content)
        
        # Padrão 2: Type assertions com any - .map((x: any) => ...
        content = re.sub(r'\(([\w\s]+):\s*any\)', r'(\1: Record<string, unknown>)', content)
        
        # Padrão 3: Variáveis tipadas como any
        # let x: any = ... para let x: unknown = ...
        content = re.sub(r':\s*any\s*=', r': unknown =', content)
        
        # Padrão 4: Tipo de retorno any
        # ): any => para ): unknown => 
        content = re.sub(r'\):\s*any\s*=>', r'): unknown =>', content)
        
        # Padrão 5: Tipo de retorno any em async
        # async (): any => para async (): Promise<unknown> =>
        content = re.sub(r'async\s+\(\):\s*any\s*=>', r'async (): Promise<unknown> =>', content)
        
        # Padrão 6: Type casting (... as any) para (... as Record<string, unknown>)
        content = re.sub(r'\s+as\s+any\)', r' as Record<string, unknown>)', content)
        
        # Padrão 7: Erro em try/catch - catch (err: any) para catch (err: unknown)
        content = re.sub(r'catch\s*\(\s*(\w+):\s*any\s*\)', r'catch (\1: unknown)', content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Erro ao processar {filepath}: {e}")
        return False

def main():
    """Processa todos os arquivos TypeScript no projeto"""
    patterns = [
        '**/*.ts',
        '**/*.tsx',
        '**/*.jsx',
    ]
    
    fixed_count = 0
    for pattern in patterns:
        for filepath in glob.glob(pattern, recursive=True):
            # Pula node_modules e .next
            if 'node_modules' in filepath or '.next' in filepath:
                continue
            
            if fix_any_types_in_file(filepath):
                print(f"✓ Corrigido: {filepath}")
                fixed_count += 1
    
    print(f"\nTotal de arquivos corrigidos: {fixed_count}")

if __name__ == '__main__':
    main()

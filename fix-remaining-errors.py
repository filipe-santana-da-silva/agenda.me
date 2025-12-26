#!/usr/bin/env python3
"""
Fix remaining 24 ESLint errors - Manual approach
"""

import os
import re

os.chdir(r'c:\Users\Filip\OneDrive\Área de Trabalho\aparatus\agenda\agenda')

# Fix 1: Replace 'any' type with proper types
fixes = {
    'app/booking/booking-page-content.tsx': [
        (663, 'any', 'Record<string, unknown>'),
        (674, 'any', 'Record<string, unknown>'),
        (706, 'any', 'Record<string, unknown>'),
    ],
    'app/chat/page.tsx': [
        (68, 'any', 'Record<string, unknown>'),
        (69, 'any', 'Record<string, unknown>'),
        (70, 'any', 'Record<string, unknown>'),
    ],
    'components/chat-fullstack-provider.tsx': [
        (32, 'any', 'Record<string, unknown>'),
        (40, 'any', 'Record<string, unknown>'),
        (70, 'any', 'Record<string, unknown>'),
    ],
    'app/api/chat-fullstack/route.ts': [
        (353, 'any', 'Record<string, unknown>'),
    ],
    'app/api/admin/appointments/route.ts': [
        (18, 'any', 'Record<string, unknown>'),
        (19, 'any', 'Record<string, unknown>'),
        (20, 'any', 'Record<string, unknown>'),
    ]
}

def fix_file_any_types(file_path, fixes):
    """Fix 'any' type declarations in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Sort fixes by line descending to avoid line number shifts
        changed = False
        for line_num, old, new in sorted(fixes, reverse=True):
            if line_num <= len(lines):
                line = lines[line_num - 1]
                # Replace 'any' with the new type
                new_line = re.sub(r'\bany\b', new, line)
                if new_line != line:
                    lines[line_num - 1] = new_line
                    print(f"  Fixed line {line_num} in {os.path.basename(file_path)}")
                    changed = True
        
        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
        return True
    except Exception as e:
        print(f"  Error fixing {file_path}: {e}")
        return False

# Apply any type fixes
print("Fixing 'any' types...")
for file_path, file_fixes in fixes.items():
    if os.path.exists(file_path):
        fix_file_any_types(file_path, file_fixes)
    else:
        print(f"  File not found: {file_path}")

print("\nCompleted! Run 'npx eslint .' to verify")

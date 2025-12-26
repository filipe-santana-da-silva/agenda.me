#!/usr/bin/env python3
"""Fix all remaining TypeScript errors in app/page.tsx"""

import os

file_path = r'c:\Users\Filip\OneDrive\Área de Trabalho\aparatus\agenda\agenda\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Remove unused variables barbershops and confirmedBookings
content = content.replace(
    "  const barbershops: Record<string, unknown>[] = []\n  const confirmedBookings: Record<string, unknown>[] = []\n\n  const features",
    "  const features"
)

# Fix 2: Fix feature.icon rendering using React.createElement
old_icon = '''                      {feature.icon && <feature.icon className="w-6 h-6 text-white" />}'''
new_icon = '''                      {feature.icon && typeof feature.icon === 'function' && React.createElement(feature.icon as React.ComponentType<{className: string}>, {className: 'w-6 h-6 text-white'})}'''
content = content.replace(old_icon, new_icon)

# Fix 3: Add proper type cast for plans[0].name
content = content.replace(
    "                  <h3 className=\"text-3xl font-bold mb-2\">{plans[0].name}</h3>",
    "                  <h3 className=\"text-3xl font-bold mb-2\">{String((plans[0] as Record<string, unknown>).name)}</h3>"
)

# Fix 4: Add proper type cast for plans[0].price
content = content.replace(
    "                      R$ {plans[0].price.toFixed(2)}",
    "                      R$ {((plans[0] as Record<string, unknown>).price as number).toFixed(2)}"
)

# Fix 5: Add proper type cast for plans[0].features
content = content.replace(
    "                  {plans[0].features.map((feature: string, i: number) => (",
    "                  {((plans[0] as Record<string, unknown>).features as string[]).map((feature: string, i: number) => ("
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all TypeScript errors in app/page.tsx")

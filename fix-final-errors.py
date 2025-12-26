#!/usr/bin/env python3
"""Fix remaining `any` patterns quickly and directly"""

import re
import glob

files_to_fix = {
    "app/api/professional-revenue/route.ts": [
        (r"const payments: any\[\]", "const payments: Array<Record<string, unknown>>"),
        (r"(\(.*?as\s+any(?:,|\)|;|$))", r"\1".replace("as any", "as Record<string, unknown>")),
    ],
    "app/api/uploads/route.ts": [
        (r"as any\)", "as Record<string, unknown>)"),
        (r"@ts-ignore", "@ts-expect-error"),
    ],
    "app/booking/booking-client.tsx": [
        (r":\s*any\)", ": Record<string, unknown>)"),
    ],
    "app/chat-fullstack/page.tsx": [
        (r"as any\)", "as Record<string, unknown>)"),
    ],
    "app/components/calendar-view-appointments.tsx": [
        (r"as any\)", "as Record<string, unknown>)"),
    ],
    "app/page.tsx": [
        (r"as any\)", "as Record<string, unknown>)"),
    ],
    "app/private/agenda/_components/calendar-content.tsx": [
        (r"as any\)", "as Record<string, unknown>)"),
    ],
    "app/private/agenda/_components/smart-schedule/smart-schedule-panel.tsx": [
        (r"as any\)", "as Record<string, unknown>)"),
    ],
}

def main():
    for filepath, fixes in files_to_fix.items():
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            for pattern, replacement in fixes:
                content = re.sub(pattern, replacement, content)
            
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✓ {filepath}")
        except Exception as e:
            print(f"✗ {filepath}: {e}")

if __name__ == '__main__':
    main()

'use client'

import React from 'react'
import { Delete } from 'lucide-react'

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
}

export default function VirtualKeyboard({ onKeyPress, onBackspace }: VirtualKeyboardProps) {
  const numberRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0'],
  ]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg border border-gray-200 w-full max-w-lg">
      {/* Title */}
      <p className="text-xs font-semibold text-gray-600 mb-4 text-center uppercase tracking-wider">
        Teclado Numérico
      </p>

      {/* Keyboard Grid */}
      <div className="space-y-3">
        {numberRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onKeyPress(key)}
                className="
                  flex-1 min-w-16 h-16 rounded-xl font-bold text-xl
                  bg-gray-200 text-gray-800
                  border border-gray-300
                  transition-all duration-150 select-none
                  active:scale-95 active:shadow-inner
                  shadow-md hover:shadow-lg hover:bg-gray-300
                "
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Backspace Row */}
        <div className="flex gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={onBackspace}
            className="
              flex-1 px-4 h-16 rounded-xl font-medium text-base
              bg-gray-200 text-gray-800
              border border-gray-300
              transition-all duration-150 select-none
              active:scale-95 active:shadow-inner
              shadow-md hover:shadow-lg hover:bg-gray-300
              flex items-center justify-center gap-2
            "
          >
            <Delete className="w-6 h-6" />
            <span>Apagar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

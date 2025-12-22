'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface IPhoneMockupProps {
  className?: string;
}

export function IPhoneMockup({ className = '' }: IPhoneMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [35, 20, 8]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 8, 2]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.7, 0.9, 1, 1]);

  return (
    <div ref={containerRef} className={`relative ${className} min-h-screen flex items-center justify-center py-16 px-4 bg-linear-to-b from-gray-100 to-gray-200`}>
      <motion.div
        style={{
          rotateY,
          rotateX,
          scale,
        }}
        className="relative"
      >
        {/* iPhone Mockup - Preto com Conteúdo */}
        <div 
          className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl"
          style={{
            width: '300px',
            height: '640px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #0a0a0a 100%)',
            boxShadow: `
              0 30px 60px rgba(0, 0, 0, 0.4),
              inset -2px 2px 5px rgba(255, 255, 255, 0.1),
              inset 2px -2px 5px rgba(0, 0, 0, 0.3)
            `
          }}
        >
          {/* Bezel */}
          <div className="absolute inset-0 rounded-3xl border-10 border-black pointer-events-none" />

          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10" />

          {/* Screen Display */}
          <div className="absolute inset-2 rounded-2xl bg-white overflow-hidden flex flex-col">
            {/* Status Bar */}
            <div className="h-6 bg-white flex items-center justify-between px-5 text-xs font-semibold border-b border-gray-100">
              <span>9:41</span>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-0.5 bg-black rounded-full" />
                <div className="w-0.5 h-0.5 bg-black rounded-full" />
                <div className="w-0.5 h-0.5 bg-black rounded-full" />
              </div>
            </div>

            {/* Header com Gradiente Roxo/Azul */}
            <div className="bg-linear-to-r from-blue-600 via-purple-600 to-blue-500 px-5 py-3 text-white flex items-center justify-between rounded-b-lg">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded bg-white/30 flex items-center justify-center text-xs">📱</div>
                <div className="w-5 h-5 rounded bg-white/30 flex items-center justify-center text-xs">⚙️</div>
                <div className="w-5 h-5 rounded bg-white/30 flex items-center justify-center text-xs">🔔</div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto bg-linear-to-b from-gray-50 to-white px-4 py-4 space-y-4">
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Bem-vindo!</p>
              </div>

              {/* Agendamentos Card */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <p className="text-xs text-gray-600 font-medium">Agendamentos</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">12</p>
              </div>

              {/* Clientes Card */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <p className="text-xs text-gray-600 font-medium">Clientes</p>
                <p className="text-4xl font-bold text-green-500 mt-2">248</p>
              </div>

              {/* Receita Card */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <p className="text-xs text-gray-600 font-medium">Receita</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">R$ 8.5k</p>
              </div>

              {/* Button */}
              <button className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
                Novo Agendamento
              </button>
            </div>

            {/* Home Indicator */}
            <div className="h-6 flex items-center justify-center bg-white">
              <div className="w-32 h-1 bg-black rounded-full opacity-20" />
            </div>
          </div>

          {/* Câmera */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 shadow-lg" />

          {/* Botões laterais esquerda */}
          <div className="absolute left-0 top-32 w-1.5 h-10 bg-gray-700 rounded-r-md shadow-md" />
          <div className="absolute left-0 top-48 w-1.5 h-14 bg-gray-700 rounded-r-md shadow-md" />

          {/* Botão lateral direita (volume) */}
          <div className="absolute -right-0.5 top-40 w-1.5 h-12 bg-gray-700 rounded-l-md shadow-md" />

          {/* Sombra 3D */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-72 h-20 bg-black/20 blur-3xl rounded-full" />

          {/* Light Reflection */}
          <div className="absolute -top-4 -right-12 w-40 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
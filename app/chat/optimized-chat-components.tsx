'use client';

import { Suspense, useMemo } from 'react';
import Image from 'next/image';

interface ChatMessagePart {
  type: 'text' | 'image';
  text?: string;
  url?: string;
}

interface ChatOption {
  id: string;
  label: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  parts?: ChatMessagePart[];
}

interface ChatMessageProps {
  message: Message;
  options: ChatOption[];
  isLastMessage: boolean;
  isLoading: boolean;
  onOptionSelect: (option: ChatOption) => void;
}

export function ChatMessage({
  message,
  options,
  isLastMessage,
  isLoading,
  onOptionSelect,
}: ChatMessageProps) {
  const memoizedContent = useMemo(() => {
    if (message.role === 'assistant') {
      return (
        <div className="flex items-start gap-2 px-3 pr-14 pt-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-primary/12 flex size-8 shrink-0 items-center justify-center rounded-full border">
            <div className="text-primary size-3.5">🤖</div>
          </div>
          <div className="flex-1">
            <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              <Suspense fallback={<div className="animate-pulse h-4 bg-gray-200 rounded w-32" />}>
                {message.parts?.map((part: ChatMessagePart, partIndex: number) =>
                  part.type === 'text' && part.text ? (
                    <div key={partIndex} className="text-gray-900">{part.text}</div>
                  ) : null,
                )}
              </Suspense>
            </div>

            {/* Quick Reply Buttons - mostrar apenas para última mensagem do bot */}
            {isLastMessage && message.role === 'assistant' && options.length > 0 && (
              <div className="mt-3 space-y-2 w-full animate-in fade-in slide-in-from-bottom-2 delay-300">
                {options.map((option: ChatOption) => (
                  <button
                    key={option.id}
                    onClick={() => onOptionSelect(option)}
                    className="w-full justify-start text-left h-auto py-2 px-3 font-normal text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-end pr-5 pl-10 pt-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-secondary rounded-full px-4 py-3 max-w-xs">
            <p className="text-sm">
              {message.parts?.map((part: ChatMessagePart, partIndex: number) =>
                part.type === 'text' && part.text ? (
                  <span key={partIndex}>{part.text}</span>
                ) : null,
              )}
            </p>
          </div>
        </div>
      );
    }
  }, [message, options, isLastMessage, isLoading, onOptionSelect]);

  return <div key={message.id}>{memoizedContent}</div>;
}

// Lazy Load Image Component
export function LazyImage({
  src,
  alt,
  width = 80,
  height = 80,
  className = '',
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={className}
    />
  );
}

// Loading Skeleton
export function ModalLoadingSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-80 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-8" />
        <div className="space-y-3">
          {[...Array(3)].map((_: unknown, i: number) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

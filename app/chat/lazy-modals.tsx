// Lazy Loading Components for Chat Modals
// These components are dynamically imported in page.tsx for better performance
// File can be deleted - it's kept for reference only

import dynamic from 'next/dynamic';

// Lazy load modals with loading fallback
export const ChatMenuModal = dynamic(() => import('./modals/chat-menu-modal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><div className="bg-white rounded-3xl p-8 w-80 animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></div></div>,
});

export const ChatServicesModal = dynamic(() => import('./modals/chat-services-modal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><div className="bg-white rounded-3xl p-8 w-80 animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></div></div>,
});

export const ChatProfessionalsModal = dynamic(() => import('./modals/chat-professionals-modal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><div className="bg-white rounded-3xl p-8 w-80 animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></div></div>,
});

export const ChatDateModal = dynamic(() => import('./modals/chat-date-modal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><div className="bg-white rounded-3xl p-8 w-80 animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></div></div>,
});

export const ChatTimeModal = dynamic(() => import('./modals/chat-time-modal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><div className="bg-white rounded-3xl p-8 w-80 animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></div></div>,
});

export const ChatSuccessModal = dynamic(() => import('./modals/chat-success-modal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><div className="bg-white rounded-3xl p-8 w-80 animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></div></div>,
});

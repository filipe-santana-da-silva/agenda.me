"use client"

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/SimpleAuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Default wrapper to be used at the application root - ensures AuthProvider is present
export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

/**
 * Middleware para cache automático em respostas HTTP
 */

import { NextResponse, NextRequest } from "next/server"

export function withHttpCache(
  response: NextResponse,
  ttl: number = 3600
): NextResponse {
  // Adicionar headers de cache HTTP
  response.headers.set("Cache-Control", `public, max-age=${ttl}, s-maxage=${ttl}`)
  response.headers.set("CDN-Cache-Control", `max-age=${ttl}`)

  return response
}

/**
 * Criar resposta em cache com headers apropriados
 */
export function createCachedResponse<T>(
  data: T,
  ttl: number = 3600,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  return withHttpCache(response, ttl)
}

/**
 * Criar resposta com erro e header de cache reduzido
 */
export function createCachedErrorResponse(
  error: unknown,
  ttl: number = 60,
  status: number = 500
): NextResponse {
  const response = NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Unknown error",
    },
    { status }
  )
  return withHttpCache(response, ttl)
}

/**
 * Middleware para validar se cliente tem cache válido
 */
export function isCacheValid(request: NextRequest, maxAge: number): boolean {
  const ifModifiedSince = request.headers.get("if-modified-since")
  const ifNoneMatch = request.headers.get("if-none-match")

  if (!ifModifiedSince && !ifNoneMatch) {
    return false
  }

  // Se o cliente tem cache, responder com 304
  if (ifModifiedSince) {
    const clientDate = new Date(ifModifiedSince).getTime()
    const maxAgeMs = maxAge * 1000
    return Date.now() - clientDate < maxAgeMs
  }

  return false
}

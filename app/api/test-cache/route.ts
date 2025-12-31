import { NextResponse } from 'next/server'
import { withCache } from '@/lib/cache'

export async function GET() {
  const data = await withCache(
    'test-key',
    async () => {
      return {
        message: 'Redis está funcionando! 🎉',
        timestamp: new Date().toISOString(),
        success: true,
      }
    },
    10 // 10 segundos de cache
  )

  return NextResponse.json(data)
}

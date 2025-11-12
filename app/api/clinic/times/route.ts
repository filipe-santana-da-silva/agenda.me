import { NextResponse } from 'next/server'
import { getTimesClinic } from '@/app/private/agenda/_data-access/get-times-clinic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || ''

    if (!userId) {
      return NextResponse.json({ times: [] }, { status: 200 })
    }

    const result = await getTimesClinic({ userId })
    return NextResponse.json(result)
  } catch (e) {
    console.error('Error in /api/clinic/times', e)
    return NextResponse.json({ times: [] }, { status: 500 })
  }
}

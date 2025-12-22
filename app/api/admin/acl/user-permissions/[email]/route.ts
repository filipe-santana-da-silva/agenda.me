import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ email?: string }> }) {
  return NextResponse.json({ data: [] })
}

export async function PUT(request: Request, { params }: { params: Promise<{ email?: string }> }) {
  return NextResponse.json({ ok: true })
}

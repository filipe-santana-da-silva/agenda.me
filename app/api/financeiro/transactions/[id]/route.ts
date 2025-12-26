import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from('transactions')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase error updating:', error)
      throw error
    }

    return NextResponse.json({ data: data?.[0] })
  } catch (error: unknown) {
    console.error('PUT /api/financeiro/transactions/:id error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error updating transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  try {
    const { id } = await params

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error deleting:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE /api/financeiro/transactions/:id error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error deleting transaction' },
      { status: 500 }
    )
  }
}

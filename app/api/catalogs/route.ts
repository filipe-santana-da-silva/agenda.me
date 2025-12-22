import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // return catalogs with their items expanded
    const { data: catalogs, error } = await supabase
      .from('catalogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // fetch items for each catalog and resolve basic details
    const results = []
    for (const c of catalogs || []) {
      const { data: items } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('catalog_id', c.id)
        .order('position')

      const expanded = []
      if (items) {
        for (const it of items) {
          let detail = null
          if (it.item_type === 'product') {
            const { data } = await supabase.from('products').select('id, name, price').eq('id', it.item_id).single()
            detail = data
          } else if (it.item_type === 'service') {
            const { data } = await supabase.from('services').select('id, name, price, duration').eq('id', it.item_id).single()
            detail = data
          } else if (it.item_type === 'professional') {
            const { data } = await supabase.from('employees').select('id, name, position, email').eq('id', it.item_id).single()
            detail = data
          }
          expanded.push({ ...it, detail })
        }
      }

      results.push({ ...c, items: expanded })
    }

    return NextResponse.json({ catalogs: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { name, description, items } = body

    if (!name) return NextResponse.json({ error: 'Missing catalog name' }, { status: 400 })

    const { data: createdCatalog, error } = await supabase
      .from('catalogs')
      .insert([{ name, description }])
      .select()

    if (error) throw error

    const catalogId = createdCatalog[0].id

    if (items && items.length > 0) {
      const insertItems = items.map((it: any, idx: number) => ({
        catalog_id: catalogId,
        item_type: it.item_type,
        item_id: it.item_id,
        position: idx,
      }))
      const { error: itemsError } = await supabase.from('catalog_items').insert(insertItems)
      if (itemsError) console.error('Error inserting catalog items', itemsError)
    }

    return NextResponse.json({ success: true, id: catalogId }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await request.json()
    const { name, description, items } = body

    if (!name) return NextResponse.json({ error: 'Missing catalog name' }, { status: 400 })

    const { error: updateError } = await supabase
      .from('catalogs')
      .update({ name, description })
      .eq('id', id)

    if (updateError) throw updateError

    // Delete existing items
    await supabase.from('catalog_items').delete().eq('catalog_id', id)

    // Insert new items
    if (items && items.length > 0) {
      const insertItems = items.map((it: any, idx: number) => ({
        catalog_id: id,
        item_type: it.item_type,
        item_id: it.item_id,
        position: idx,
      }))
      const { error: itemsError } = await supabase.from('catalog_items').insert(insertItems)
      if (itemsError) console.error('Error inserting catalog items', itemsError)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase.from('catalogs').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

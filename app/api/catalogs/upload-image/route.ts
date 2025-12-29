import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Use service role client for uploads (bypass RLS)
    const supabase = await createServiceRoleClient()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const catalogName = formData.get('catalogName') as string

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 })
    }

    if (!catalogName) {
      return NextResponse.json({ error: 'Nome do catálogo é obrigatório' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const sanitizedName = catalogName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const fileName = `${sanitizedName}-${timestamp}.${fileExt}`
    const filePath = `catalogs/${fileName}`

    console.log('Uploading file:', { fileName, filePath, fileSize: buffer.byteLength, contentType: file.type })

    // Upload the file directly without checking bucket existence
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erro ao fazer upload: ' + uploadError.message }, { status: 500 })
    }

    console.log('File uploaded successfully:', uploadData)

    // Get the public URL
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)

    console.log('Generated public URL:', urlData.publicUrl)

    return NextResponse.json({ imageUrl: urlData.publicUrl, success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload error:', errorMessage)
    return NextResponse.json({ error: 'Erro ao fazer upload: ' + errorMessage }, { status: 500 })
  }
}

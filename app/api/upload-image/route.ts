import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const itemName = formData.get('itemName') as string
    const itemType = formData.get('itemType') as string

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 })
    }

    if (!itemName) {
      return NextResponse.json({ error: 'Nome do item é obrigatório' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const sanitizedName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const folderType = itemType || 'items'
    const fileName = `${sanitizedName}-${timestamp}.${fileExt}`
    const filePath = `${folderType}/${fileName}`

    console.log('Uploading file:', { fileName, filePath, fileSize: buffer.byteLength, contentType: file.type })

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

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)

    console.log('Generated public URL:', urlData.publicUrl)

    return NextResponse.json({ imageUrl: urlData.publicUrl, success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload error:', errorMessage)
    return NextResponse.json({ error: 'Erro ao fazer upload: ' + errorMessage }, { status: 500 })
  }
}

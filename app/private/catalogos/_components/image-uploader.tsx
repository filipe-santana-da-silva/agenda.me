'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  onUpload: (imageUrl: string) => void
  currentImage?: string
  catalogName: string
}

export function ImageUploader({ onUpload, currentImage, catalogName }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('catalogName', catalogName)

      const response = await fetch('/api/catalogs/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload da imagem')
      }

      const { imageUrl } = await response.json()
      onUpload(imageUrl)
      toast.success('Imagem enviada com sucesso')
    } catch (error) {
      const err = error as Record<string, unknown>
      toast.error((err.message as string) || 'Erro ao fazer upload')
      setPreview(currentImage || null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        {preview ? (
          <div className="relative">
            <Image src={preview} alt="Preview" width={200} height={150} className="w-full h-auto rounded object-cover max-h-32 mx-auto" />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setPreview(null)
              }}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-4">
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Clique para selecionar uma imagem</p>
            <p className="text-xs text-muted-foreground mt-1">Qualquer tipo de imagem (máx. 5MB)</p>
          </div>
        )}
        <Input
          ref={fileInputRef}
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>
      {isUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
    </div>
  )
}

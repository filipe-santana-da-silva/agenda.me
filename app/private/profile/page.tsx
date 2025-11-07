'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function MeuPerfilPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchSession()
  }, [])

  async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Erro ao fazer logout:', error.message)
    return
  }
  router.push('/login')
}

  async function fetchSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      router.push('/login')
      return
    }

    const { data: papel, error: papelError } = await supabase
      .from('user_permission')
      .select('role:role_id(name)')
      .eq('email', session.user.email.toLowerCase())
      .single()

    if (papelError || !papel?.role) {
      console.error('Erro ao buscar papel:', papelError?.message)
      router.push('/acesso-negado')
      return
    }

    // Trata role como array ou objeto, dependendo do retorno
    const roleName = Array.isArray(papel.role)
      ? papel.role[0]?.name
      : papel.role?.name

    if (!roleName) {
      router.push('/acesso-negado')
      return
    }

    setUserId(session.user.id)
    fetchUser(session.user.id)
  }

  async function fetchUser(id: string) {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle()

    if (data) {
      setName(data.name ?? '')
      setAddress(data.address ?? '')
      setPhone(data.phone ?? '')
    }

    if (error) console.error('Erro ao buscar perfil:', error.message)
  }

  async function handleSave() {
    if (!userId) return
    setLoading(true)

    const { error } = await supabase
      .from('User')
      .upsert(
        {
          id: userId,
          name,
          address,
          phone,
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error('Erro ao salvar perfil:', error.message)
    }

    setLoading(false)
  }

  return (
    <div className="w-full min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl">
        <div className="flex justify-center mb-6">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Foto de perfil"
              width={112}
              height={112}
              className="rounded-full object-cover border shadow"
            />
          ) : (
            <Image
              src="/logo.svg"
              alt="Logo"
              width={112}
              height={112}
              className="rounded-full object-contain shadow-md"
            />
          )}
        </div>

        <h1 className="text-3xl font-bold text-center mb-10">Meu Perfil</h1>

        <div className="space-y-6">
          <Input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-lg"
          />
          <Input
            placeholder="Endereço completo"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full text-lg"
          />
          <Input
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full text-lg"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="mt-10 w-full text-lg py-3"
        >
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="mt-4 w-full text-lg py-3"
        >
          Sair da conta
        </Button>

      </div>
    </div>
  )
}

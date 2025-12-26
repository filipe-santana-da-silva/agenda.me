'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/contexts/SimpleAuthContext'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, LogOut, Save, Upload, Moon, Sun, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type UserProfile = {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: string | null
  bio: string | null
  avatar_url: string | null
  created_at?: string
  updated_at?: string
}

export function ProfilePageClient() {
  const supabase = createClient()
  const router = useRouter()
  const { logout, user: authUser, isLoading: authLoading } = useAuth()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: 'filipesantana859@gmail.com',
    phone: '',
    address: '',
    bio: '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      toast.success('Modo escuro ativado')
    } else {
      document.documentElement.classList.remove('dark')
      toast.success('Modo claro ativado')
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchUserProfile()
    }
  }, [authLoading, authUser])

  useEffect(() => {
    console.log('authUser completo:', authUser)
    if (authUser?.email) {
      console.log('Preenchendo email:', authUser.email)
      setFormData(prev => ({ ...prev, email: authUser.email }))
    } else {
      console.log('authUser ou email não disponível')
    }
  }, [authUser])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar dados do usuário autenticado ou dados padrão
      const userData = authUser || {
        id: '1',
        email: 'filipesantana859@gmail.com',
        name: 'Filipe Santana',
        role: 'ADMIN'
      }
      
      console.log('Dados do usuário:', userData)

      // Carregar dados salvos do localStorage
      const savedAvatar = localStorage.getItem(`avatar_${userData.id}`)
      const savedProfile = localStorage.getItem(`profile_${userData.id}`)
      
      let profileData = {
        name: userData.name,
        phone: null,
        address: null,
        bio: null
      }

      if (savedProfile) {
        try {
          profileData = JSON.parse(savedProfile)
        } catch (e) {
          console.error('Erro ao parsear perfil salvo:', e)
        }
      }
      
      const profile = {
        id: userData.id,
        email: userData.email,
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        avatar_url: savedAvatar
      }

      setUser(profile)
      setAvatarUrl(savedAvatar)
      setFormData({
        name: profileData.name || '',
        email: userData.email || 'filipesantana859@gmail.com',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || ''
      })
    } catch (err: Record<string, unknown>) {
      const message = err?.message || 'Erro ao carregar perfil'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (formData.phone && !/^[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Telefone inválido'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 2MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `user-${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profile')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      localStorage.setItem(`avatar_${user?.id}`, publicUrl)
      toast.success('Foto atualizada com sucesso!')
    } catch (err: Record<string, unknown>) {
      toast.error(err.message || 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)

    try {
      if (!user?.id) throw new Error('ID do usuário não encontrado')

      localStorage.setItem(`profile_${user.id}`, JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        avatar_url: avatarUrl
      }))

      toast.success('Perfil atualizado com sucesso!')
      fetchUserProfile()
    } catch (err: Record<string, unknown>) {
      toast.error(err.message || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      logout()
      toast.success('Desconectado com sucesso')
      router.push('/login')
    } catch (err: Record<string, unknown>) {
      toast.error('Erro ao sair da conta')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3 sm:space-y-6 p-3 sm:p-6 dark:bg-slate-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight dark:text-slate-100">Meu Perfil</h1>
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-300 mt-1">Gerencie suas informações</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="dark:bg-slate-800 dark:border-slate-700 grid w-full grid-cols-2 h-9 sm:h-10">
          <TabsTrigger value="info" className="dark:text-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white text-xs sm:text-sm">Informações</TabsTrigger>
          <TabsTrigger value="security" className="dark:text-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white text-xs sm:text-sm">Segurança</TabsTrigger>
        </TabsList>

        {/* INFO TAB */}
        <TabsContent value="info" className="space-y-3 sm:space-y-4">
          {/* Avatar Card */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="dark:text-slate-100 text-sm sm:text-base">Foto de Perfil</CardTitle>
              <CardDescription className="dark:text-slate-300 text-xs">Adicione uma imagem</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
                  <AvatarImage src={avatarUrl || user?.avatar_url || undefined} />
                  <AvatarFallback className="text-sm sm:text-base md:text-lg">
                    {formData.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left">
                  <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-slate-300">
                    PNG, JPG até 2MB
                  </p>
                  <label htmlFor="avatar-upload">
                    <Button 
                      variant="outline" 
                      className="gap-1.5 text-xs h-8 sm:h-9" 
                      disabled={uploading}
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      type="button"
                    >
                      <Upload className="w-3 h-3" />
                      {uploading ? 'Enviando...' : 'Carregar'}
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info Card */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="dark:text-slate-100 text-sm sm:text-base">Informações Pessoais</CardTitle>
              <CardDescription className="dark:text-slate-300 text-xs">
                Atualize seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-0">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-xs sm:text-sm">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 text-xs sm:text-sm h-9 sm:h-10"
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 text-xs sm:text-sm h-9 sm:h-10"
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-xs sm:text-sm">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 text-xs sm:text-sm h-9 sm:h-10"
                  aria-invalid={!!formErrors.phone}
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-xs sm:text-sm">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Rua, número..."
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1 text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio" className="text-xs sm:text-sm">Biografia</Label>
                <Textarea
                  id="bio"
                  placeholder="Fale sobre você..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="mt-1 min-h-16 sm:min-h-20 text-xs sm:text-sm"
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-2 pt-1 sm:pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2 flex-1 text-xs sm:text-sm h-9 sm:h-10"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-3 sm:space-y-4">
          {/* Onboarding Card */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="dark:text-slate-100 text-sm sm:text-base">Configuração Inicial</CardTitle>
              <CardDescription className="dark:text-slate-300 text-xs">
                Guia de primeiros passos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <Label className="text-xs sm:text-sm font-medium dark:text-slate-100">Tour Guiado</Label>
                  <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-slate-300">
                    Aprenda a usar o sistema
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="gap-1.5 text-xs h-8 sm:h-9 w-full sm:w-auto"
                  onClick={() => {
                    localStorage.setItem('start_tour', 'true')
                    router.push('/private/agenda')
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Iniciar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="dark:text-slate-100 text-sm sm:text-base">Preferências</CardTitle>
              <CardDescription className="dark:text-slate-300 text-xs">
                Configure a interface
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <Label className="text-xs sm:text-sm font-medium dark:text-slate-100">Modo Escuro</Label>
                  <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-slate-300">
                    Tema escuro
                  </p>
                </div>
                <Button
                  onClick={toggleDarkMode}
                  variant={isDarkMode ? "default" : "outline"}
                  className="gap-1.5 text-xs h-8 sm:h-9 w-full sm:w-auto"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-3 h-3" />
                      Claro
                    </>
                  ) : (
                    <>
                      <Moon className="w-3 h-3" />
                      Escuro
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="dark:text-slate-100 text-sm sm:text-base">Informações da Conta</CardTitle>
              <CardDescription className="dark:text-slate-300 text-xs">
                Detalhes da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 pt-0">
              <div>
                <Label className="text-xs text-muted-foreground dark:text-slate-300">ID da Conta</Label>
                <p className="font-mono text-xs mt-1 p-2 bg-muted rounded break-all">
                  {user?.id}
                </p>
              </div>
              {user?.created_at && (
                <div>
                  <Label className="text-xs text-muted-foreground dark:text-slate-300">Membro desde</Label>
                  <p className="text-sm mt-1">
                    {new Date(user.created_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:bg-slate-800 dark:border-red-400">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-red-600 dark:text-red-400 text-sm sm:text-base">Zona de Perigo</CardTitle>
              <CardDescription className="dark:text-slate-300 text-xs">
                Ações irreversíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="gap-2 w-full text-xs sm:text-sm h-9 sm:h-10"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

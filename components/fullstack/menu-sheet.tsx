"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MenuIcon, Home, CalendarDays, LogOut, LogIn } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const categories = [
  { label: "Cabelo", search: "cabelo" },
  { label: "Barba", search: "barba" },
  { label: "Acabamento", search: "acabamento" },
  { label: "Sobrancelha", search: "sobrancelha" },
  { label: "Massagem", search: "massagem" },
  { label: "Hidratacao", search: "hidratacao" },
]

const MenuSheet = () => {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }
    getSession()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Erro ao sair")
      return
    }
    setSession(null)
    toast.success("Saído com sucesso")
    router.push("/")
  }

  const isLoggedIn = !!session?.user

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="border-border border-b px-5 py-6 text-left">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between px-5">
            {isLoggedIn && session?.user ? (
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage
                    src={session.user.user_metadata?.avatar_url || undefined}
                    alt={session.user.user_metadata?.full_name ?? "User"}
                  />
                  <AvatarFallback>
                    {session.user.user_metadata?.full_name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {session.user.user_metadata?.full_name ?? session.user.email}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {session.user.email}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold">Olá. Faça seu login!</p>
                <Button className="gap-3 rounded-full" onClick={handleLogin}>
                  Login
                  <LogIn className="size-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col">
            <SheetClose asChild>
              <Link
                href="/booking"
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium"
              >
                <Home className="size-4" />
                Início
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/bookings"
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium"
              >
                <CalendarDays className="size-4" />
                Agendamentos
              </Link>
            </SheetClose>
          </div>

          <div className="border-border border-b" />

          <div className="flex flex-col gap-1">
            {categories.map((category) => (
              <SheetClose key={category.search} asChild>
                <Link
                  href={`/barbershops?search=${category.search}`}
                  className="px-5 py-3 text-sm font-medium"
                >
                  {category.label}
                </Link>
              </SheetClose>
            ))}
          </div>

          <div className="border-border border-b" />

          {isLoggedIn && (
            <Button
              variant="ghost"
              className="justify-left w-fit text-left"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sair da conta
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MenuSheet

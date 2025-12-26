"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MenuIcon, Home, CalendarDays, LogOut, LogIn } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

const categories = [
  { label: "Cabelo", search: "cabelo" },
  { label: "Barba", search: "barba" },
  { label: "Acabamento", search: "acabamento" },
  { label: "Sobrancelha", search: "sobrancelha" },
  { label: "Massagem", search: "massagem" },
  { label: "Hidratacao", search: "hidratacao" },
];

const MenuSheet = () => {
  const [bookingUser, setBookingUser] = useState<{ name: string; phone: string } | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUsers = async () => {
      // Verificar se há usuário logado no localStorage (cliente)
      const savedUser = localStorage.getItem("bookingUser");
      if (savedUser) {
        setBookingUser(JSON.parse(savedUser));
      }

      // Verificar se há usuário autenticado no Supabase
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setAuthUser(currentUser);
      setLoading(false);
    };
    getUsers();
  }, [supabase]);

  const handleLogin = () => {
    router.push("/booking?login=true");
  };

  const handleLogout = async () => {
    // Logout do cliente (localStorage)
    if (bookingUser) {
      localStorage.removeItem("bookingUser");
      setBookingUser(null);
    }

    // Logout do Supabase se houver usuário autenticado
    if (authUser) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
    }

    toast.success("Logout realizado com sucesso!");
    router.push("/booking?login=true");
  };

  const isLoggedIn = !!bookingUser || !!authUser;

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
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback>
                    {(bookingUser?.name || authUser?.user_metadata?.name || authUser?.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {bookingUser?.name || authUser?.user_metadata?.name || authUser?.email}
                  </span>
                  {bookingUser?.phone && (
                    <span className="text-muted-foreground text-sm">
                      {bookingUser.phone}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold">Olá. Faça seu login!</p>
                <Button 
                  className="gap-3 rounded-full" 
                  onClick={() => {
                    handleLogin();
                  }}
                >
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
                href={bookingUser ? "/meus-agendamentos" : "/booking"}
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
                  href={`/service/${category.search}`}
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
  );
};

export default MenuSheet;


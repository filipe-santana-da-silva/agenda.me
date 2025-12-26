"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/SimpleAuthContext"
import { usePathname } from "next/navigation"
import { usePermissions } from "@/utils/hooks/usePermissions"
import clsx from "clsx";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List, Calendar, Users, Briefcase, Package, Grid3x3, Wallet, Users2, Settings, Shield, CreditCard, Headset, MessageSquare, Star } from "lucide-react";

import Link from 'next/link'
import Image from "next/image";

import {
  Collapsible,
  CollapsibleContent
} from "@/components/ui/collapsible"

export function SideBarDashboard({ children }: {children: React.ReactNode}){
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, login, logout } = useAuth()
    const { hasPermission, isAdmin } = usePermissions()

    const allMainMenuItems = [
        { href: "/private/agenda", label: "Agendamentos", icon: Calendar, permission: "agenda" as const, tourId: "agenda-link" },
        { href: "/private/clientes", label: "Clientes", icon: Users, permission: "clientes" as const, tourId: "clientes-link" },
        { href: "/private/servicos", label: "Serviços", icon: Briefcase, permission: "servicos" as const, tourId: "servicos-link" },
        { href: "/private/produtos", label: "Produtos", icon: Package, permission: "produtos" as const, tourId: "produtos-link" },
        { href: "/private/catalogos", label: "Catálogos", icon: Grid3x3, permission: "catalogos" as const, tourId: "catalogos-link" },
        { href: "/private/financeiro", label: "Financeiro", icon: Wallet, permission: "financeiro" as const, tourId: "financeiro-link" },
        { href: "/private/funcionarios", label: "Funcionários", icon: Users2, permission: "funcionarios" as const, tourId: "funcionarios-link" }
    ]

    const allSettingsMenuItems = [
        { href: "/private/planos", label: "Planos", icon: CreditCard, permission: "planos" as const, tourId: "planos-link" },
        { href: "/private/permissoes", label: "Permissões", icon: Shield, permission: "permissoes" as const, tourId: "permissoes-link" },
        { href: "/private/suporte", label: "Suporte de TI", icon: Headset, permission: "suporte" as const, tourId: "suporte-link" },
        { href: "/private/profile", label: "Meu perfil", icon: Settings, permission: "profile" as const, tourId: "profile-link" },
    ]



    // Filtrar itens baseado nas permissões
    const mainMenuItems = allMainMenuItems.filter(item => hasPermission(item.permission))
    const settingsMenuItems = allSettingsMenuItems.filter(item => hasPermission(item.permission))

    return(
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-slate-900">
            <aside className={clsx("flex flex-col border-r bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm transition-all duration-300 h-screen overflow-hidden", {
                "w-16 lg:w-20": isCollapsed,
                "w-56 md:w-64": !isCollapsed,
                "hidden md:flex md:fixed md:z-40": true 
            })}>
                {/* Header with logo and toggle */}
                <div className={clsx("flex items-center justify-between gap-2 border-b dark:border-slate-700", {
                    "p-2 lg:p-4": isCollapsed,
                    "p-3 md:p-4": !isCollapsed
                })}>
                    <div className="flex flex-col flex-1">
                        {!isCollapsed && (
                            <Image src="/logo.png" alt="Logo da recreart" className="w-28 md:w-32 h-auto" height={60} width={140} priority quality={100}/>
                        )}
                        {/* Nome do usuário logado */}
                        {!isCollapsed && user && user.name && (
                            <span className="text-xs text-gray-700 dark:text-slate-200 mt-1">Olá, {user.name}</span>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)} 
                            suppressHydrationWarning
                            className="shrink-0 h-8 w-8 lg:h-9 lg:w-9"
                        >
                            {!isCollapsed ? <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5"/> : <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5"/>}
                        </Button>
                    </div>
                </div>

                {/* Collapsed nav */}
                {isCollapsed && (
                    <nav className="flex flex-col gap-2 lg:gap-3 p-1.5 lg:p-2 overflow-y-auto flex-1">
                        {mainMenuItems.map((item) => (
                            <NavIconButton key={item.href} {...item} pathname={pathname} />
                        ))}
                        <div className="flex-1" />
                        <div className="border-t pt-1.5 lg:pt-2">
                            {settingsMenuItems.map((item) => (
                                <NavIconButton key={item.href} {...item} pathname={pathname} />
                            ))}
                        </div>
                    </nav>
                )}

                {/* Expanded nav */}
                <Collapsible open={!isCollapsed} className="flex flex-col flex-1">
                    <CollapsibleContent suppressHydrationWarning className="flex flex-col flex-1 overflow-hidden">
                        <nav className="flex flex-col gap-0.5 md:gap-1 p-3 md:p-4 flex-1 overflow-y-auto">
                            {/* Main section */}
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 md:mb-3 pl-2">Painel</p>
                                <div className="space-y-0.5 md:space-y-1">
                                    {mainMenuItems.map((item) => (
                                        <NavLink key={item.href} {...item} pathname={pathname} />
                                    ))}
                                </div>
                            </div>

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Settings section */}
                            <div className="pt-3 md:pt-4 border-t dark:border-slate-700">
                                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 md:mb-3 pl-2">Configurações</p>
                                <div className="space-y-0.5 md:space-y-1">
                                    {settingsMenuItems.map((item) => (
                                        <NavLink key={item.href} {...item} pathname={pathname} />
                                    ))}
                                </div>
                            </div>
                        </nav>
                    </CollapsibleContent>
                </Collapsible>
            </aside>

            {/* Main content */}
            <div className={clsx("flex flex-1 flex-col transition-all duration-300", {
                "md:ml-16 lg:ml-20": isCollapsed,
                "md:ml-56 lg:ml-64": !isCollapsed
            })}>
                {/* Mobile header */}
                <header className="md:hidden flex items-center justify-between border-b bg-white dark:bg-slate-800 dark:border-slate-700 px-3 sm:px-4 h-14 sm:h-16 z-10 sticky top-0">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <SheetTrigger asChild suppressHydrationWarning>
                                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 sm:h-9 sm:w-9" suppressHydrationWarning>
                                    <List className="w-4 h-4 sm:w-5 sm:h-5"/>
                                </Button>
                            </SheetTrigger>
                            <h1 className="text-base sm:text-lg font-semibold truncate dark:text-slate-100">Agenda.me</h1>
                        </div>
                        <SheetContent side="left" className="p-0 w-72 sm:w-80">
                            <div className="flex flex-col h-full">
                                <div className="p-3 sm:p-4 border-b dark:border-slate-700">
                                    <SheetTitle className="text-lg dark:text-slate-100">Menu</SheetTitle>
                                </div>
                                <nav className="flex flex-col gap-0.5 p-3 sm:p-4 flex-1 overflow-y-auto">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Painel</p>
                                    {mainMenuItems.map((item) => (
                                        <NavLink key={item.href} {...item} pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} />
                                    ))}
                                    <div className="flex-1" />
                                    <div className="border-t dark:border-slate-700 pt-3 sm:pt-4">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Configurações</p>
                                        {settingsMenuItems.map((item) => (
                                            <NavLink key={item.href} {...item} pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} />
                                        ))}
                                    </div>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </header>
                <main className="flex-1 py-4 sm:py-6 px-3 sm:px-4 md:px-6 lg:px-8 overflow-auto dark:bg-slate-900">
                    {children}
                </main>
            </div>
        </div>
    )
}

interface NavItemProps {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    pathname: string;
    permission?: string;
    tourId?: string;
    onNavigate?: () => void;
}

function NavLink({ href, icon: Icon, label, pathname, tourId, onNavigate }: NavItemProps) {
    const isActive = pathname === href
    return (
        <Link href={href} onClick={onNavigate}>
            <div className={clsx(
                "flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all duration-200 font-medium text-xs md:text-sm",
                isActive 
                    ? "bg-blue-500 text-white shadow-md" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600"
            )} data-tour={tourId}>
                <Icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="truncate">{label}</span>
            </div>
        </Link>
    )
}

function NavIconButton({ href, icon: Icon, label, pathname }: NavItemProps) {
    const isActive = pathname === href
    return (
        <Link href={href}>
            <div className={clsx(
                "flex items-center justify-center p-1.5 lg:p-2 rounded-lg transition-all duration-200",
                isActive 
                    ? "bg-blue-500 text-white shadow-md" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600"
            )} title={label}>
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
        </Link>
    )
}

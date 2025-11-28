"use client"

import { useId, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"
import clsx from "clsx";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List, Settings } from "lucide-react";


import Link from 'next/link'
import Image from "next/image";
import logoImg from '../../../public/logo.svg'

import {
  Collapsible,
  CollapsibleContent
} from "@/components/ui/collapsible"

export function SideBarDashboard({ children }: {children: React.ReactNode}){
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    // use stable ids to avoid hydration mismatch from Radix-generated ids
    const collapsibleId = useId()
    const mobileSheetId = useId()
    const { user } = useAuth()

    return(
        <div className="flex min-h-screen w-full">
            <aside className={clsx("flex flex-col border-r bg-background transition-all duration-300 p-4 h-full", {
                "w-20": isCollapsed,
                "w-64": !isCollapsed,
                "hidden md:flex md:fixed": true 
            })}>
                <div className="">
                    {!isCollapsed && (
                        <Image src={logoImg} alt="Logo da recreart" className="w-18 h-18" priority quality={100}/>
                    )}
                </div>
                <Button className="bg-gray-100 hover:bg-gray-50 text-zinc-900 self-end" onClick={() => setIsCollapsed(!isCollapsed)} aria-controls={collapsibleId} suppressHydrationWarning>
                    {!isCollapsed ? <ChevronLeft className="w-12 h-12"/> : <ChevronRight className="w-12 h-12"/>}
                </Button>

                                {isCollapsed && (
                    <nav className="flex flex-col gap-1 overflow-hidden mt-2">
                                                                                {/* Render links based on role: ADMIN sees all, RECREADOR limited */}
                                                                                {user?.role === 'ADMIN' ? (
                                                                                    <>
                                                                                        <SideBarLink href="/private/agenda" label="Agendamentos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/notebook (1).png" alt="Ícone de agenda" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/recreadores" label="Recreadores" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baloes.svg" alt="Ícone de balão" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/contratantes" label="Contratantes" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/contratantes.svg" alt="Ícone de engrenagem" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/ranking" label="Ranking" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/ranking.png" alt="Ícone de medalha" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/malas" label="Mala" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baggage.png" alt="Ícone de mala" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/contratos" label="Contratos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/contrato.svg" alt="Ícone de contrato" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/estoque" label="Estoque" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/estoque.svg" alt="Ícone de estoque" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/profile" label="Meu perfil" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/settings (1).png" alt="Ícone de meu perfil" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/permissoes" label="Permissões" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/cloud-server.png" alt="Ícone de permissões" width={44} height={44} className="w-6 h-6"/>}/>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <SideBarLink href="/private/agenda" label="Agendamentos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/notebook (1).png" alt="Ícone de agenda" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/malas" label="Mala" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baggage.png" alt="Ícone de mala" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/estoque" label="Estoque" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/estoque.svg" alt="Ícone de estoque" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                        <SideBarLink href="/private/profile" label="Meu perfil" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/settings (1).png" alt="Ícone de meu perfil" width={24} height={24} className="w-6 h-6"/>}/>
                                                                                    </>
                                                                                )}
                    </nav>
                )}

                <Collapsible open={!isCollapsed}>
                    <CollapsibleContent id={collapsibleId} suppressHydrationWarning>
                            <nav className="flex flex-col gap-1 overflow-hidden">
                                <span className="text-sm text-gray-400 font-medium mt-1 uppercase">Painel</span>
                                {/* Use the already-declared `user` from the top of the component to avoid calling hooks inside render */}
                                {user?.role === 'ADMIN' ? (
                                    <>
                                        <SideBarLink href="/private/agenda" label="Agendamentos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/notebook (1).png" alt="Ícone de agenda" width={24} height={24} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/recreadores" label="Recreadores" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baloes.svg" alt="Ícone de balão" width={34} height={34} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/contratantes" label="Contratantes" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/contratantes.svg" alt="Ícone de engrenagem" width={24} height={24} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/ranking" label="Ranking" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/ranking.png" alt="Ícone de medalha" width={24} height={24} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/malas" label="Mala" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baggage.png" alt="Ícone de mala" width={24} height={24} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/contratos" label="Contratos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/contrato.svg" alt="Ícone de contrato" width={24} height={24} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/estoque" label="Estoque" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/estoque.svg" alt="Ícone de estoque" width={24} height={24} className="w-6 h-6"/>}/>
                                        <span className="text-sm text-gray-400 font-medium mt-1 uppercase">Configurações</span>
                                        <SideBarLink href="/private/profile" label="Meu perfil" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/settings (1).png" alt="Ícone de meu perfil" width={24} height={24} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/permissoes" label="Permissões" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/cloud-server.png" alt="Ícone de permissões" width={24} height={24} className="w-6 h-6"/>}/>
                                    </>
                                ) : (
                                    <>
                                        <SideBarLink href="/private/agenda" label="Agendamentos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/notebook (1).png" alt="Ícone de agenda" width={24} height={24} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/malas" label="Mala" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baggage.png" alt="Ícone de mala" width={24} height={24} className="w-6 h-6"/>}/>
                                        <SideBarLink href="/private/estoque" label="Estoque" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/estoque.svg" alt="Ícone de estoque" width={24} height={24} className="w-6 h-6"/>}/>
                                        <span className="text-sm text-gray-400 font-medium mt-1 uppercase">Configurações</span>
                                        <SideBarLink href="/private/profile" label="Meu perfil" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/settings (1).png" alt="Ícone de meu perfil" width={24} height={24} className="w-6 h-6"/>}/>
                                    </>
                                )}
                            </nav>
                        </CollapsibleContent>
                </Collapsible>
            </aside>
            <div className={clsx("flex flex-1 flex-col transition-all duration-300", {
                "md:ml-20": isCollapsed,
                "md:ml-64": !isCollapsed
            })}>
                <header className="md:hidden flex items-center justify-between border-b px-4 md:px-6 h-14 z-10 sticky top-0 bg-white">
                    <Sheet>
                        <div className="flex items-center gap-4">
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsCollapsed(false)} suppressHydrationWarning>
                                    <List className="w-5 h-5 ml-2"/>
                                </Button>
                            </SheetTrigger>
                            <h1 className="text-base md:text-lg font-semibold">Menu Recreart</h1>
                        </div>
                        <SheetContent id={mobileSheetId} side="left" className="sm:max-w-xs text-black" suppressHydrationWarning>
                            <SheetTitle className=" text-base text-black font-semibold">Recreart</SheetTitle>
                            <SheetDescription>Menu administrativo</SheetDescription>
                            <nav className="grid gap-2 text-base pt-5 ">
                                                                {user?.role === 'ADMIN' ? (
                                                                    <>
                                                                        <SideBarLink href="/private/agenda" label="Agendamentos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/notebook (1).png" alt="Ícone de agenda" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/recreadores" label="Recreadores" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baloes.svg" alt="Ícone de balão" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/contratantes" label="Contratantes" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/contratantes.svg" alt="Ícone de engrenagem" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/ranking" label="Ranking" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/ranking.png" alt="Ícone de medalha" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/malas" label="Mala" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baggage.png" alt="Ícone de mala" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/contratos" label="Contratos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/contrato.svg" alt="Ícone de contrato" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/estoque" label="Estoque" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/estoque.svg" alt="Ícone de estoque" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/profile" label="Meu perfil" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/settings (1).png" alt="Ícone de meu perfil" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/permissoes" label="Permissões" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/cloud-server.png" alt="Ícone de permissões" width={24} height={24} className="w-6 h-6"/>}/>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <SideBarLink href="/private/agenda" label="Agendamentos" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/notebook (1).png" alt="Ícone de agenda" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/malas" label="Mala" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/baggage.png" alt="Ícone de mala" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/estoque" label="Estoque" pathname={pathname} isColapsed={isCollapsed} icon={<Image src="/inventory.png" alt="Ícone de estoque" width={24} height={24} className="w-6 h-6"/>}/>
                                                                        <SideBarLink href="/private/profile" label="Meu perfil" pathname={pathname} isColapsed={isCollapsed} icon={<Settings className="w-6 h-6"/>}/>
                                                                    </>
                                                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </header>
                <main className="flex-1 py-4 px-2 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

interface SideBarLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    pathname: string;
    isColapsed: boolean;
}

function SideBarLink({href, icon, isColapsed, label, pathname}: SideBarLinkProps){
    return (
        <Link href={href}>
            <div className={clsx("flex items-center gap-2 px-3 py-2 rounded-md transition-colors",{
                "text-white bg-blue-500 ": pathname === href,
                "text-black font-semibold hover:bg-gray-100": pathname !== href
            })}>
                <span className="w-6 h-6">{icon}</span>
                {!isColapsed && <span>{label}</span>}
            </div>
        </Link>
    )
}
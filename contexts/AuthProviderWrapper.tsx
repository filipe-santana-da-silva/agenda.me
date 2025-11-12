"use client"

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Users,
  FileText,
  TrendingUp,
  UserCircle,
  Shield,
  Briefcase,
  CalendarDays,
  Package,
  Archive,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: ReactNode;
  roles: ("ADMIN" | "RECREADOR")[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/private/agenda",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ["ADMIN", "RECREADOR"],
  },
  // Páginas exclusivas do ADMIN
  {
    title: "Recreadores",
    path: "/private/recreadores",
    icon: <Users className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    title: "Contratantes",
    path: "/private/contratantes",
    icon: <Briefcase className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    title: "Contratos",
    path: "/private/contratos",
    icon: <FileText className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    title: "Ranking",
    path: "/private/ranking",
    icon: <TrendingUp className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    title: "Permissões",
    path: "/private/permissoes",
    icon: <Shield className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  // Páginas do RECREADOR (ADMIN também tem acesso)
  {
    title: "Malas",
    path: "/private/malas",
    icon: <Package className="h-4 w-4" />,
    roles: ["ADMIN", "RECREADOR"],
  },
  {
    title: "Estoque",
    path: "/private/estoque",
    icon: <Archive className="h-4 w-4" />,
    roles: ["ADMIN", "RECREADOR"],
  },
  // Disponível para todos
  {
    title: "Meu Perfil",
    path: "/private/profile",
    icon: <UserCircle className="h-4 w-4" />,
    roles: ["ADMIN", "RECREADOR"],
  },
];

const queryClient = new QueryClient()

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter((item) => {
    // Converter path para PagePermission (remover a barra inicial)
    const page = item.path.substring(1) as any;
    return hasPermission(page);
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Sistema de Agendamento
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.role}</p>
          </div>

          {/* Menu */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {filteredMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    location.pathname === item.path &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Button>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}

// Default wrapper to be used at the application root - ensures AuthProvider is present
export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

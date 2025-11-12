export type PagePermission = 
  | "dashboard"
  | "recreadores"
  | "contratantes"
  | "contratos"
  | "ranking"
  | "permissoes"
  | "agendamentos"
  | "malas"
  | "estoque"
  | "perfil";

export interface UserPermissions {
  userId: string;
  pages: PagePermission[];
}

export const ALL_PAGES: { id: PagePermission; label: string; category: string }[] = [
  { id: "dashboard", label: "Dashboard", category: "Geral" },
  { id: "perfil", label: "Meu Perfil", category: "Geral" },
  { id: "recreadores", label: "Recreadores", category: "Administração" },
  { id: "contratantes", label: "Contratantes", category: "Administração" },
  { id: "contratos", label: "Contratos", category: "Administração" },
  { id: "ranking", label: "Ranking", category: "Administração" },
  { id: "permissoes", label: "Permissões", category: "Administração" },
  { id: "agendamentos", label: "Agendamentos", category: "Operacional" },
  { id: "malas", label: "Malas", category: "Operacional" },
  { id: "estoque", label: "Estoque", category: "Operacional" },
];

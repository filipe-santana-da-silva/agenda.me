export type UserRole = "ADMIN" | "FUNCIONARIO";

export type PagePermission = 
  | "agenda"
  | "clientes"
  | "servicos"
  | "produtos"
  | "catalogos"
  | "financeiro"
  | "funcionarios"
  | "avaliacoes"
  | "permissoes"
  | "profile"
  | "suporte"
  | "planos";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  password_plain?: string;
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
  pages: PagePermission[];
}

export const ROLE_PERMISSIONS: Record<UserRole, PagePermission[]> = {
  ADMIN: ["agenda", "clientes", "servicos", "produtos", "catalogos", "financeiro", "funcionarios", "avaliacoes", "permissoes", "profile", "suporte", "planos"],
  FUNCIONARIO: ["agenda", "clientes", "servicos", "produtos", "catalogos", "avaliacoes", "profile", "suporte"]
};

export const ALL_PAGES: { id: PagePermission; label: string; category: string }[] = [
  { id: "agenda", label: "Agendamentos", category: "Operacional" },
  { id: "clientes", label: "Clientes", category: "Operacional" },
  { id: "servicos", label: "Serviços", category: "Operacional" },
  { id: "produtos", label: "Produtos", category: "Operacional" },
  { id: "catalogos", label: "Catálogos", category: "Operacional" },
  { id: "financeiro", label: "Financeiro", category: "Administração" },
  { id: "funcionarios", label: "Funcionários", category: "Administração" },
  { id: "avaliacoes", label: "Avaliações", category: "Administração" },
  { id: "permissoes", label: "Permissões", category: "Administração" },
  { id: "planos", label: "Planos", category: "Configurações" },
  { id: "suporte", label: "Suporte de TI", category: "Configurações" },
  { id: "profile", label: "Meu Perfil", category: "Configurações" },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  FUNCIONARIO: "Funcionário"
};

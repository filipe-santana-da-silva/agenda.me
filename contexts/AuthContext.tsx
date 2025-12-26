import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

// Role is flexible/free-text (stored as the literal name). Use uppercase when
// checking for ADMIN convenience.
interface User {
  id: string;
  name?: string | null;
  email: string;
  role?: string; // free-text role name
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<User | null>;
  deleteUser: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: unknown = null;

    async function init() {
      setIsLoading(true);
      try {
        const supabase = createClient();

        // getSession and getUser separately (supabase-js v2)
        const {
          data: { session },
        } = await (await supabase).auth.getSession();
        const {
          data: { user: supUser },
        } = await (await supabase).auth.getUser();

        if (!session || !supUser) {
          if (mounted) setUser(null);
          setIsLoading(false);
          return;
        }

        // Buscar role da tabela system_users
        let role: string | undefined;
        try {
          const { data: systemUser } = await (await supabase)
            .from('system_users')
            .select('role, name')
            .eq('id', supUser.id)
            .single();
          
          role = systemUser?.role;
        } catch (err) {
          console.log('Usuário não encontrado na tabela system_users');
          role = undefined;
        }

        const currentUser: User = {
          id: supUser.id,
          name: supUser.user_metadata?.name ?? supUser.email,
          email: supUser.email ?? "",
          role,
        };

        if (mounted) setUser(currentUser);
      } catch (err) {
        console.error("AuthProvider init error:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    (async () => {
      const supabase = createClient();
      // set up subscription once
      try {
        const { data } = await (await supabase).auth.onAuthStateChange((_event, _s) => {
          init().catch(() => {});
        });
        // data may contain a subscription depending on SDK
        subscription = (data as { subscription?: unknown })?.subscription ?? null;
      } catch (e) {
        // ignore
      }

      // initial run
      init();
    })();

    return () => {
      mounted = false;
      if (subscription && typeof (subscription as { unsubscribe: () => void })?.unsubscribe === "function") {
        try {
          (subscription as { unsubscribe: () => void }).unsubscribe();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await (await supabase).auth.signInWithPassword({ email, password });
      if (error) throw error;

      // onAuthStateChange will refresh user
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await (await supabase).auth.signOut();
      setUser(null);
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Minimal admin operations (best-effort; require proper DB permissions)
  const createUser = async (userData: Partial<User>): Promise<User | null> => {
      // RBAC/user_permission removed — this operation no longer persists a separate
      // role mapping. Return a best-effort created user object (caller can
      // implement real persistence if needed).
      if (!userData.email) return null;
      return {
        id: `${Date.now()}`,
        email: userData.email.toLowerCase(),
        name: userData.name,
        role: userData.role,
      };
  };

  const deleteUser = async (userId: string) => {
    try {
      const supabase = createClient();
      await (await supabase).from("User").delete().eq("id", userId);
    } catch (e) {
      console.error("deleteUser error:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        createUser,
        deleteUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

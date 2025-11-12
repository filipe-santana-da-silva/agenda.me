import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PagePermission } from "@/types/permissions";
import { createClient } from "@/utils/supabase/client";

// Role is flexible/free-text (stored as the literal name). Use uppercase when
// checking for ADMIN convenience.
interface User {
  id: string;
  name?: string | null;
  email: string;
  role?: string; // free-text role name
  // store customPermissions as page IDs (UUIDs) for canonical checks
  customPermissions?: string[];
  // optional map name->id for convenience when checking by PagePermission name
  pageNameToId?: Record<string, string>;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<User | null>;
  updateUserPermissions: (userId: string, permissions: PagePermission[]) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  // Accept either a PagePermission name (string union) or a page id (UUID)
  hasPermission: (page: PagePermission | string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

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

        // Lookup role/permissions by email in user_permission table
        const email = supUser.email?.toLowerCase() ?? "";
        try {
          const { data: papel } = await (await supabase)
            .from("user_permission")
            .select("role:role_id(name)")
            .eq("email", email)
            .maybeSingle();

          // papel may be { role: { name: 'ADMIN' } } or { role: [{ name: 'ADMIN' }] }
          const roleName = Array.isArray((papel as any)?.role)
            ? (papel as any).role[0]?.name
            : (papel as any)?.role?.name;

          const role = roleName || undefined;

          const currentUser: User = {
            id: supUser.id,
            name: supUser.user_metadata?.name ?? supUser.email,
            email: supUser.email ?? "",
            role,
          };

          // Load pages table to build a name->id map and to help normalize
          // permissions. We'll store customPermissions as page IDs (UUIDs).
          try {
            const { data: allPages } = await (await supabase).from('page').select('id,name,route')
            const nameToId: Record<string, string> = {}
            if (Array.isArray(allPages)) {
              allPages.forEach((p: any) => {
                if (p?.name && p?.id) nameToId[(p.name || '').toString().toLowerCase()] = p.id
              })
              currentUser.pageNameToId = nameToId
            }

            // Try relational embed (works if page_id is a FK to page)
            try {
              const { data: userPages, error: upErr } = await (await supabase)
                .from('user_page_permission')
                .select('page:page_id(id,name,route)')
                .ilike('email', email)

              if (!upErr && Array.isArray(userPages) && userPages.length > 0 && userPages[0]?.page) {
                const ids = userPages
                  .map((p: any) => p?.page?.id)
                  .filter(Boolean) as string[]
                if (ids.length > 0) currentUser.customPermissions = ids
              } else {
                // Fallback: page_id may be a plain uuid or a jsonb array. Read raw values and resolve.
                const { data: userPagesRaw } = await (await supabase)
                  .from('user_page_permission')
                  .select('page_id')
                  .ilike('email', email)

                const idsSet = new Set<string>()
                if (Array.isArray(userPagesRaw)) {
                  for (const r of userPagesRaw) {
                    const pid = r?.page_id
                    if (!pid) continue
                    if (Array.isArray(pid)) {
                      pid.forEach((v: any) => typeof v === 'string' && idsSet.add(v))
                    } else if (typeof pid === 'string') {
                      idsSet.add(pid)
                    } else if (pid && pid.value) {
                      // sometimes jsonb may come wrapped
                      try {
                        const parsed = JSON.parse(pid.value)
                        if (Array.isArray(parsed)) parsed.forEach((v: any) => typeof v === 'string' && idsSet.add(v))
                      } catch {}
                    }
                  }
                }

                const ids = Array.from(idsSet)
                if (ids.length > 0) {
                  currentUser.customPermissions = ids
                }
              }
            } catch (e) {
              // If relational embed fails (e.g. because page_id is jsonb), fallback to raw read
              try {
                const { data: userPagesRaw } = await (await supabase)
                  .from('user_page_permission')
                  .select('page_id')
                  .ilike('email', email)

                const idsSet = new Set<string>()
                if (Array.isArray(userPagesRaw)) {
                  for (const r of userPagesRaw) {
                    const pid = r?.page_id
                    if (!pid) continue
                    if (Array.isArray(pid)) {
                      pid.forEach((v: any) => typeof v === 'string' && idsSet.add(v))
                    } else if (typeof pid === 'string') {
                      idsSet.add(pid)
                    } else if (pid && pid.value) {
                      try {
                        const parsed = JSON.parse(pid.value)
                        if (Array.isArray(parsed)) parsed.forEach((v: any) => typeof v === 'string' && idsSet.add(v))
                      } catch {}
                    }
                  }
                }

                const ids = Array.from(idsSet)
                if (ids.length > 0) currentUser.customPermissions = ids
              } catch (ee) {
                console.debug('failed to load user_page_permission (fallback) for', email, ee)
              }
            }
          } catch (e) {
            // ignore per-user permission lookup errors; fall back to role
            console.debug('failed to load pages or user_page_permission for', email, e)
          }

          if (mounted) setUser(currentUser);
        } catch (e) {
          // If permission lookup fails, still set user without default role
          const currentUser: User = {
            id: supUser.id,
            name: supUser.user_metadata?.name ?? supUser.email,
            email: supUser.email ?? "",
            role: undefined,
          };
          if (mounted) setUser(currentUser);
        }
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
        subscription = (data as any)?.subscription ?? null;
      } catch (e) {
        // ignore
      }

      // initial run
      init();
    })();

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === "function") {
        try {
          subscription.unsubscribe();
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
    try {
      // This is a shallow implementation: create a row in `User` or `user_permission` if needed
      const supabase = createClient();
      // Example: insert into user_permission table
      if (!userData.email) return null;
      const payload: any = { email: userData.email.toLowerCase() };
      if (userData.role) payload.role_id = userData.role;
      const { data, error } = await (await supabase)
        .from("user_permission")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id ?? `${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      };
    } catch (e) {
      console.error("createUser error:", e);
      return null;
    }
  };

  const updateUserPermissions = async (userId: string, permissions: PagePermission[]) => {
    try {
      const supabase = createClient();
      // For demonstration, update a `user_permissions` JSON column if exists
      await (await supabase)
        .from("User")
        .update({ custom_permissions: permissions })
        .eq("id", userId);
      // If current user updated, refresh
      if (user?.id === userId) {
        // naive refresh: re-run auth init by calling logout+re-login is not ideal; keep it simple
        // In production you'd fetch the updated row and setUser
      }
    } catch (e) {
      console.error("updateUserPermissions error:", e);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const supabase = createClient();
      await (await supabase).from("User").delete().eq("id", userId);
    } catch (e) {
      console.error("deleteUser error:", e);
    }
  };

  const hasPermission = (page: PagePermission | string): boolean => {
    if (!user) return false;
    if (user.role && (user.role as string).toUpperCase() === "ADMIN") return true;

    // If customPermissions are provided as page IDs, check directly.
    if (user.customPermissions && user.customPermissions.length > 0) {
      // If caller passed a page id, check inclusion directly
      if (user.customPermissions.includes(page as string)) return true

      // If caller passed a page name (e.g. 'agendamentos'), try to map to id
      const map = user.pageNameToId || {}
      const pageId = map[page as string]
      if (pageId && user.customPermissions.includes(pageId)) return true
    }

    // Deny by default when no custom permissions and not ADMIN
    return false
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        createUser,
        updateUserPermissions,
        deleteUser,
        hasPermission,
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

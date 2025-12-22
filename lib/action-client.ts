import { createSafeActionClient } from "next-safe-action";
import { createClient } from "@/utils/supabase/server";

export const actionClient = createSafeActionClient();

export const protectedActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Não autorizado. Por favor, faça login para continuar.");
  }

  return next({ ctx: { user } });
});


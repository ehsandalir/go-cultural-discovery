import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-side role check. Roles live in public.user_roles and are verified via the
 * has_role() database function with the caller's own token — never trusted from the client.
 * Roles (who you are) are separate from plans/entitlements (what you subscribed to).
 */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error("Could not verify access");
    return { isAdmin: data === true, plan: "go" as const };
  });

/** GO Studio data — rejects non-admins on the server. */
export const getStudioOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) return { allowed: false as const };
    const { data: plans } = await context.supabase
      .from("subscription_plans")
      .select("code,name_en,name_fa")
      .order("sort_order");
    return { allowed: true as const, plans: plans ?? [] };
  });

import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser } },
}));

import { Route } from "@/routes/_authenticated/route";

describe("protected route authentication", () => {
  beforeEach(() => getUser.mockReset());

  it("returns signed-out visitors to their requested page after login", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const beforeLoad = Route.options.beforeLoad!;
    await expect(
      beforeLoad({
        location: { pathname: "/library", href: "/library?sort=recent#saved" },
      } as never),
    ).rejects.toMatchObject({
      options: { to: "/auth", search: { next: "/library?sort=recent#saved" } },
    });
  });

  it("allows an authenticated visitor to continue", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "signed-in-user" } } });
    const beforeLoad = Route.options.beforeLoad!;
    await expect(beforeLoad({ location: { href: "/library" } } as never)).resolves.toBeUndefined();
  });
});

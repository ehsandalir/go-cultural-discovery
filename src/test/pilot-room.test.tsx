import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PersonalRoomHero } from "@/components/go/personal-room";
import { ROOM_PALETTES } from "@/lib/personal-room";
import { VIBES } from "@/lib/vibes";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock("@/hooks/use-session", () => ({ useSession: () => ({ user: null, ready: true }) }));
vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ t: ({ en }: { en: string }) => en }) }));

describe("GO pilot interactive four-wall room", () => {
  beforeEach(() => localStorage.clear());

  it("has exactly four independent walls with accessible navigation", () => {
    render(<PersonalRoomHero />);
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tab", { name: "Window" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Cinema" }));
    expect(screen.getByRole("tab", { name: "Cinema" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Next wall" }));
    expect(screen.getByRole("tab", { name: "Music" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Books" }));
    expect(screen.getByRole("tab", { name: "Books" }).getAttribute("aria-selected")).toBe("true");
  });

  it("uses six palettes and twenty-four cultural Vibes rather than AI generation", () => {
    const { container } = render(<PersonalRoomHero />);
    expect(ROOM_PALETTES).toHaveLength(6);
    expect(VIBES).toHaveLength(24);
    expect(container.querySelectorAll('button[aria-pressed]')).toHaveLength(30);
    expect(screen.getByText("GoVibe")).toBeTruthy();
    expect(screen.getByText("Public room number: not assigned")).toBeTruthy();
    expect(screen.queryByText(/Realize My Room|Generate Room|DNA/)).toBeNull();
  });

  it("does not fabricate a registered public room for guests", () => {
    render(<PersonalRoomHero />);
    expect(screen.getByText("Guest preview")).toBeTruthy();
    expect(screen.getByText("Public room number: not assigned")).toBeTruthy();
  });
});

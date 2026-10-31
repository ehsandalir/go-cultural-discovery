/** Accept only same-origin in-app paths as post-authentication destinations. */
export function authReturnPath(value: unknown, fallback = "/profile"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  // Backslashes can be interpreted as slashes in URLs; controls can corrupt redirects.
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const origin = "https://go.invalid";
    const target = new URL(value, origin);
    if (target.origin !== origin || target.pathname === "/auth") return fallback;
    return target.pathname + target.search + target.hash;
  } catch {
    return fallback;
  }
}

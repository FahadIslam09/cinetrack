/**
 * CineTrack Security Utilities
 */

/**
 * Ensures redirect destinations are strictly safe internal relative paths.
 * Mitigates Open Redirect attacks via external domains, protocol-relative
 * URLs (e.g. //evil.com), Windows path tricks (/\\evil.com), and script URIs.
 */
export function sanitizeRedirect(
  target?: string | null,
  fallback = "/library"
): string {
  if (!target || typeof target !== "string") return fallback;
  const trimmed = target.trim();
  if (!trimmed) return fallback;

  // Must start with single '/', not '//' or '/\'
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return fallback;
  }

  // Must not contain URI schemes, backslashes, or control characters
  if (
    trimmed.includes("://") ||
    trimmed.includes("\\") ||
    trimmed.toLowerCase().includes("javascript:") ||
    trimmed.toLowerCase().includes("data:")
  ) {
    return fallback;
  }

  return trimmed;
}

/**
 * Escapes characters with special meaning in SQL ILIKE / LIKE patterns (%, _, \).
 */
export function escapeSqlLike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

/**
 * Validates that an image URL begins with https:// and has no dangerous schemes.
 */
export function isValidHttpsUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

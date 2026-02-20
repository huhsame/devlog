const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Prepend the Astro `base` path to an absolute URL path. */
export function withBase(path: string): string {
  if (path.startsWith("/")) {
    return `${BASE}${path}`;
  }
  return path;
}

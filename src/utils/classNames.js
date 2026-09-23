/**
 * Joins truthy class name fragments together. Intentionally minimal —
 * avoids pulling in a dependency for something this small.
 */
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

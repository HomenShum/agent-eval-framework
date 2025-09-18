export const TEST_USER_HEADER = "x-test-user-id";
export const DEFAULT_TEST_USER_ID =
  process.env.PUBLIC_TEST_USER_ID || process.env.NEXT_PUBLIC_HARDCODED_USER_ID || "test-user";

/**
 * Resolve the caller's user id for public demos. In production this would come from auth middleware,
 * but here we fall back to a deterministic test user for reproducibility.
 */
export function resolveTestUserId(req: Request): string {
  const headerValue = req.headers?.get(TEST_USER_HEADER)?.trim();
  return headerValue && headerValue.length > 0 ? headerValue : DEFAULT_TEST_USER_ID;
}

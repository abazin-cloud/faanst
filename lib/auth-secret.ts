const normalizeSecret = (value?: string) => value?.trim() || undefined;

const resolvedSecret =
  normalizeSecret(process.env.AUTH_SECRET) ??
  normalizeSecret(process.env.NEXTAUTH_SECRET);

if (!resolvedSecret) {
  throw new Error(
    'AUTH_SECRET or NEXTAUTH_SECRET must be set for authentication to work.'
  );
}

// Ensure both env variable names are populated so any Auth.js helpers that
// check one or the other always receive the same secret value at runtime.
if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = resolvedSecret;
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = resolvedSecret;
}

export const authSecret = resolvedSecret;

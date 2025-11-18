import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.POSTGRES_URL ??
      process.env.DATABASE_URL ??
      process.env.POSTGRES_PRISMA_URL ??
      (() => {
        throw new Error(
          'Database connection string missing: set POSTGRES_URL (or DATABASE_URL/POSTGRES_PRISMA_URL)'
        );
      })(),
  },
} satisfies Config;


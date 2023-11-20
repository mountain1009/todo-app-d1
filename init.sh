npx drizzle-kit generate:sqlite

# db適応
npx wrangler d1 migrations apply todo --local

npx wrangler d1 migrations apply todo

/**
 * One-off migration runner.
 *
 * Applies every supabase/migrations/*.sql file in filename order against the
 * Supabase Postgres pooler. The DB password is read from the PGPASSWORD env
 * var so it is never written to disk.
 *
 * Usage (PowerShell):
 *   $env:PGPASSWORD="<your-db-password>"; node scripts/run-migrations.mjs
 *
 * After it finishes, delete this script if you prefer (the SQL lives in
 * supabase/migrations/ and is the source of truth).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase", "migrations");

const PROJECT_REF = "mqikdfabcilglqoovyon";
const password = process.env.PGPASSWORD;

if (!password) {
  console.error("ERROR: set PGPASSWORD before running this script.");
  process.exit(1);
}

// Session-mode pooler (port 5432) — correct for running DDL/migrations.
const client = new pg.Client({
  host: "aws-1-sa-east-1.pooler.supabase.com",
  port: 5432,
  user: `postgres.${PROJECT_REF}`,
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Connected to Postgres.\n");

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    process.stdout.write(`Applying ${file} ... `);
    try {
      await client.query(sql);
      console.log("OK");
    } catch (err) {
      console.log("FAILED");
      console.error(`\n  ${err.message}\n`);
      throw err;
    }
  }

  console.log("\nAll migrations applied. Verifying seed data...");
  const { rows: cats } = await client.query(
    "select count(*)::int as n from public.categories",
  );
  const { rows: prods } = await client.query(
    "select count(*)::int as n from public.products",
  );
  console.log(`  categories: ${cats[0].n}`);
  console.log(`  products:   ${prods[0].n}`);
}

main()
  .then(() => client.end())
  .then(() => {
    console.log("\nDone.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\nMigration run aborted:", err.message);
    client.end();
    process.exit(1);
  });

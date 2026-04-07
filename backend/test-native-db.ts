import { Pool } from "pg";
import "dotenv/config";

const connectionString = "postgresql://postgres:password@localhost:5432/rangya";
console.log("Testing connection to native PG on 5432:", connectionString);

const pool = new Pool({ connectionString });

async function test() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connection successful! Time:", (res.rows[0] as any)?.now);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables in DB:", (tables.rows as any[]).map(r => r.table_name));
  } catch (err) {
    console.error("Connection failed!", err);
  } finally {
    await pool.end();
  }
}

test();

#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import pg from "pg";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function runMigrationDirectSQL(filename) {
  console.log(`\n📝 Running migration: ${filename}`);

  const sqlPath = join(__dirname, "..", "database", filename);
  const sql = readFileSync(sqlPath, "utf-8");

  if (!databaseUrl) {
    console.log(
      "\n⚠️  DATABASE_URL not found. Please run this SQL in your Supabase SQL Editor:"
    );
    console.log("─".repeat(60));
    console.log(sql);
    console.log("─".repeat(60));
    return;
  }

  try {
    const client = new pg.Client({
      connectionString: databaseUrl,
    });

    await client.connect();
    console.log("✅ Connected to database");

    await client.query(sql);
    console.log("✅ Migration completed successfully!");

    await client.end();
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log("\n📋 SQL that failed:");
    console.log("─".repeat(60));
    console.log(sql);
    console.log("─".repeat(60));
    process.exit(1);
  }
}

// Run migrations
console.log("🚀 Database Migration Tool\n");

// Get migration file from command line argument
const migrationFile =
  process.argv[2] || "migrations/002_notifications_schema.sql";
runMigrationDirectSQL(migrationFile);

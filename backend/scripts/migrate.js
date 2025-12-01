#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filename) {
  console.log(`\n📝 Running migration: ${filename}`);
  
  const sqlPath = join(__dirname, '..', 'database', filename);
  const sql = readFileSync(sqlPath, 'utf-8');
  
  // Note: Supabase doesn't support raw SQL execution via JS client
  // You need to run this in Supabase SQL Editor or use psql
  console.log('\n⚠️  Please run this SQL in your Supabase SQL Editor:');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
}

// Run migrations
console.log('🚀 Database Migration Tool\n');
runMigration('fix_role_trigger.sql');

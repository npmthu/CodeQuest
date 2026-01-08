#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  console.log('🔄 Applying feedback schema updates...\n');

  const sqlStatements = [
    // Add session_id to feedback
    `ALTER TABLE interview_feedback 
      ADD COLUMN IF NOT EXISTS session_id UUID 
      REFERENCES mock_interview_sessions(id) ON DELETE CASCADE;`,
    
    // Make booking_id nullable
    `ALTER TABLE interview_feedback 
      ALTER COLUMN booking_id DROP NOT NULL;`,
    
    // Make learner_id nullable
    `ALTER TABLE interview_feedback 
      ALTER COLUMN learner_id DROP NOT NULL;`,
    
    // Add comments field
    `ALTER TABLE interview_feedback 
      ADD COLUMN IF NOT EXISTS comments TEXT;`,
    
    // Add feedback_type
    `ALTER TABLE interview_feedback 
      ADD COLUMN IF NOT EXISTS feedback_type VARCHAR(50) 
      DEFAULT 'learner_feedback'
      CHECK (feedback_type IN ('learner_feedback', 'instructor_system', 'peer_review'));`
  ];

  for (const sql of sqlStatements) {
    try {
      console.log(`⏳ Executing: ${sql.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec', { sql });
      
      if (error && error.code !== 'PGRST204') {
        // PGRST204 means column already exists, which is fine
        console.error(`❌ Error: ${error.message}`);
      } else {
        console.log('✅ Success');
      }
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
  }

  console.log('\n✨ Schema update complete!');
}

applySchema().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Helper script to get credentials in the format needed for Heroku
 * Run: node get-heroku-credentials.js
 */

const fs = require('fs');
const path = require('path');

const credentialsPath = path.join(__dirname, 'credentials.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Error: credentials.json file not found in project root');
  console.error('Please create credentials.json first');
  process.exit(1);
}

try {
  const credentials = fs.readFileSync(credentialsPath, 'utf8');
  
  // Validate JSON
  JSON.parse(credentials);
  
  // Remove newlines and extra spaces to make it a single line
  const minified = JSON.stringify(JSON.parse(credentials));
  
  console.log('\n✅ SUCCESS! Copy the command below and run it to set your Heroku credentials:\n');
  console.log('─'.repeat(80));
  console.log(`\nheroku config:set GOOGLE_CREDENTIALS='${minified}'\n`);
  console.log('─'.repeat(80));
  console.log('\nOr copy just the JSON value below to set manually in Heroku dashboard:\n');
  console.log('─'.repeat(80));
  console.log(`\n${minified}\n`);
  console.log('─'.repeat(80));
  console.log('\n💡 Tip: For manual setup in Heroku dashboard:');
  console.log('   1. Go to your app Settings');
  console.log('   2. Click "Reveal Config Vars"');
  console.log('   3. Add key: GOOGLE_CREDENTIALS');
  console.log('   4. Paste the JSON value above\n');
  
} catch (error) {
  console.error('❌ Error reading or parsing credentials.json:', error.message);
  process.exit(1);
}


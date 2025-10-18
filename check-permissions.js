/**
 * Permission Diagnostic Tool
 * Run this to check which folders have correct permissions
 */

require('dotenv').config();
const driveService = require('./services/driveService');

async function checkAllFolders() {
  console.log('\n=== Checking Folder Permissions ===\n');
  console.log('Service Account: tr11-142@trailers-475407.iam.gserviceaccount.com\n');

  try {
    // Get all 3D folders
    const folders = await driveService.get3DFoldersWithImages();
    
    console.log(`Found ${folders.length} folders in "3D" folder\n`);
    
    for (const folder of folders) {
      console.log(`📁 ${folder.name}`);
      console.log(`   ID: ${folder.id}`);
      
      // Test if we can create files in this folder
      const result = await driveService.testFolderPermissions(folder.id);
      
      if (result.canCreate) {
        console.log(`   ✅ CAN CREATE FILES - Permissions OK`);
      } else {
        console.log(`   ❌ CANNOT CREATE FILES - ${result.message}`);
        console.log(`   → Need to share this folder with Editor permissions`);
      }
      console.log('');
    }
    
    console.log('\n=== Summary ===');
    const canCreate = folders.filter(async f => {
      const r = await driveService.testFolderPermissions(f.id);
      return r.canCreate;
    }).length;
    
    console.log(`Folders with correct permissions: ${canCreate}/${folders.length}`);
    
    if (canCreate < folders.length) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('Share folders marked with ❌ with:');
      console.log('   Email: tr11-142@trailers-475407.iam.gserviceaccount.com');
      console.log('   Permission: Editor (not Viewer!)');
    } else {
      console.log('\n✅ All folders have correct permissions!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('3D folder not found')) {
      console.log('\n⚠️  The "3D" folder was not found or not shared with the service account.');
      console.log('Please share the "3D" folder first:');
      console.log('   Email: tr11-142@trailers-475407.iam.gserviceaccount.com');
      console.log('   Permission: Viewer or Editor');
    }
  }
}

// Run the check
console.log('Starting permission check...');
checkAllFolders().then(() => {
  console.log('\nCheck complete!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


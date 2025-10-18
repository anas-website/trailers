/**
 * Google Apps Script to create Discription.txt files in all folders under "3D" folder
 * 
 * HOW TO USE:
 * 1. Go to https://script.google.com/
 * 2. Click "New Project"
 * 3. Paste this code
 * 4. Update the FOLDER_ID below with your 3D folder ID
 * 5. Click "Run" button and grant permissions
 * 6. Check the logs (View → Logs or Ctrl+Enter)
 */

function createDescriptionFiles() {
  // ===== CONFIGURATION =====
  // Replace this with your 3D folder ID
  // Get it from the URL: https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
  var MAIN_FOLDER_ID = 'PUT_YOUR_3D_FOLDER_ID_HERE';
  
  var FILE_NAME = 'Discription.txt';
  var DEFAULT_CONTENT = 'No description';
  
  // ===== END CONFIGURATION =====
  
  try {
    Logger.log('=== Starting to create description files ===\n');
    
    // Get the main "3D" folder
    var mainFolder = DriveApp.getFolderById(MAIN_FOLDER_ID);
    Logger.log('Found main folder: ' + mainFolder.getName());
    
    // Get all subfolders
    var subfolders = mainFolder.getFolders();
    var totalFolders = 0;
    var created = 0;
    var skipped = 0;
    var errors = 0;
    
    // Process each subfolder
    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      totalFolders++;
      
      try {
        Logger.log('\n📁 Processing folder: ' + folder.getName());
        
        // Check if Discription.txt already exists
        var files = folder.getFilesByName(FILE_NAME);
        
        if (files.hasNext()) {
          Logger.log('   ⏭️  File already exists, skipping');
          skipped++;
        } else {
          // Create the text file
          var blob = Utilities.newBlob(DEFAULT_CONTENT, 'text/plain', FILE_NAME);
          var file = folder.createFile(blob);
          
          Logger.log('   ✅ Created: ' + file.getName());
          created++;
        }
        
      } catch (e) {
        Logger.log('   ❌ Error: ' + e.toString());
        errors++;
      }
    }
    
    // Summary
    Logger.log('\n=== SUMMARY ===');
    Logger.log('Total folders processed: ' + totalFolders);
    Logger.log('Files created: ' + created);
    Logger.log('Files skipped (already exist): ' + skipped);
    Logger.log('Errors: ' + errors);
    Logger.log('\n✅ Done!');
    
  } catch (e) {
    Logger.log('❌ Fatal error: ' + e.toString());
    Logger.log('\nPlease check:');
    Logger.log('1. Did you update MAIN_FOLDER_ID with your 3D folder ID?');
    Logger.log('2. Do you have access to the folder?');
  }
}

/**
 * Alternative function: Create with custom content
 * This allows you to set initial content for all descriptions
 */
function createDescriptionFilesWithCustomContent() {
  var MAIN_FOLDER_ID = 'PUT_YOUR_3D_FOLDER_ID_HERE';
  var FILE_NAME = 'Discription.txt';
  
  // Custom content - you can change this
  var CUSTOM_CONTENT = 'Description coming soon...';
  
  try {
    var mainFolder = DriveApp.getFolderById(MAIN_FOLDER_ID);
    var subfolders = mainFolder.getFolders();
    var count = 0;
    
    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      var files = folder.getFilesByName(FILE_NAME);
      
      if (!files.hasNext()) {
        var blob = Utilities.newBlob(CUSTOM_CONTENT, 'text/plain', FILE_NAME);
        folder.createFile(blob);
        Logger.log('Created in: ' + folder.getName());
        count++;
      }
    }
    
    Logger.log('\nCreated ' + count + ' description files!');
    
  } catch (e) {
    Logger.log('Error: ' + e.toString());
  }
}

/**
 * Utility function: List all folders to help you verify
 */
function listAllFolders() {
  var MAIN_FOLDER_ID = 'PUT_YOUR_3D_FOLDER_ID_HERE';
  
  try {
    var mainFolder = DriveApp.getFolderById(MAIN_FOLDER_ID);
    var subfolders = mainFolder.getFolders();
    
    Logger.log('Folders in "' + mainFolder.getName() + '":');
    Logger.log('');
    
    var count = 0;
    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      count++;
      
      // Check if Discription.txt exists
      var files = folder.getFilesByName('Discription.txt');
      var hasFile = files.hasNext() ? '✅ Has file' : '❌ No file';
      
      Logger.log(count + '. ' + folder.getName() + ' - ' + hasFile);
    }
    
    Logger.log('\nTotal: ' + count + ' folders');
    
  } catch (e) {
    Logger.log('Error: ' + e.toString());
  }
}


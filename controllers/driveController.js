const driveService = require('../services/driveService');

// List files from Google Drive
exports.listFiles = async (req, res) => {
  try {
    const { pageSize = 10, pageToken, query } = req.query;
    const files = await driveService.listFiles(parseInt(pageSize), pageToken, query);
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific file
exports.getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { download } = req.query;
    
    const fileData = await driveService.getFile(fileId, download === 'true');
    
    if (download === 'true') {
      res.set({
        'Content-Type': fileData.mimeType,
        'Content-Disposition': `attachment; filename="${fileData.name}"`,
      });
      res.send(fileData.data);
    } else {
      res.json(fileData);
    }
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload file to Google Drive
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, description, folderId } = req.body;
    
    const file = await driveService.uploadFile({
      name: name || req.file.originalname,
      mimeType: req.file.mimetype,
      data: req.file.buffer,
      description,
      folderId
    });

    res.json({ 
      message: 'File uploaded successfully',
      file 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update file in Google Drive
exports.updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name, description } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (req.file) {
      updateData.mimeType = req.file.mimetype;
      updateData.data = req.file.buffer;
    }

    const file = await driveService.updateFile(fileId, updateData);

    res.json({ 
      message: 'File updated successfully',
      file 
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete file from Google Drive
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    await driveService.deleteFile(fileId);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get 3D folders with images
exports.get3DFolders = async (req, res) => {
  try {
    const folders = await driveService.get3DFoldersWithImages();
    res.json({ folders });
  } catch (error) {
    console.error('Error getting 3D folders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get image as base64
exports.getImageBase64 = async (req, res) => {
  try {
    const { fileId } = req.params;
    const imageData = await driveService.getImageAsBase64(fileId);
    res.json(imageData);
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create uploads folder in a folder
exports.createUploadsFolder = async (req, res) => {
  try {
    const { folderId, folderName } = req.body;
    
    if (!folderId || !folderName) {
      return res.status(400).json({ error: 'Folder ID and name are required' });
    }

    const result = await driveService.createUploadsFolderInFolder(folderId, folderName);
    res.json(result);
  } catch (error) {
    console.error('Error creating uploads folder:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create or update description file
exports.saveDescription = async (req, res) => {
  try {
    const { folderId, folderName, description } = req.body;
    
    if (!folderId || !folderName) {
      return res.status(400).json({ error: 'Folder ID and name are required' });
    }

    if (description === undefined || description === null) {
      return res.status(400).json({ error: 'Description content is required' });
    }

    const result = await driveService.createOrUpdateTextFile('Discription.txt', description, folderId);
    res.json(result);
  } catch (error) {
    console.error('Error saving description:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test folder permissions
exports.testFolderPermissions = async (req, res) => {
  try {
    const { folderId } = req.body;
    
    if (!folderId) {
      return res.status(400).json({ error: 'Folder ID is required' });
    }

    const result = await driveService.testFolderPermissions(folderId);
    res.json(result);
  } catch (error) {
    console.error('Error testing permissions:', error);
    res.status(500).json({ error: error.message });
  }
};


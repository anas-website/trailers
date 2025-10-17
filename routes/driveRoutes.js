const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// List files from Google Drive
router.get('/files', driveController.listFiles);

// Get a specific file from Google Drive
router.get('/files/:fileId', driveController.getFile);

// Upload file to Google Drive
router.post('/upload', upload.single('file'), driveController.uploadFile);

// Delete file from Google Drive
router.delete('/files/:fileId', driveController.deleteFile);

// Update file in Google Drive
router.put('/files/:fileId', upload.single('file'), driveController.updateFile);

// OAuth callback
router.get('/oauth2callback', driveController.oauth2callback);

// Get authorization URL
router.get('/auth-url', driveController.getAuthUrl);

// Get 3D folders with images
router.get('/3d-folders', driveController.get3DFolders);

// Get image as base64
router.get('/image/:fileId', driveController.getImageBase64);

// Create uploads folder
router.post('/create-uploads-folder', driveController.createUploadsFolder);

// Save description
router.post('/save-description', driveController.saveDescription);

module.exports = router;


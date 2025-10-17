const { google } = require('googleapis');
const stream = require('stream');

class DriveService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
   

    // Set credentials if refresh token is available
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
    }

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  // Get authorization URL
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Get tokens from authorization code
  async getTokenFromCode(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // List files from Google Drive
  async listFiles(pageSize = 10, pageToken = null, query = null) {
    try {
      const params = {
        pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc'
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      if (query) {
        params.q = query;
      }

      const response = await this.drive.files.list(params);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // Get file metadata or download file
  async getFile(fileId, download = false) {
    try {
      if (download) {
        const fileMetadata = await this.drive.files.get({
          fileId,
          fields: 'name, mimeType'
        });

        const response = await this.drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'arraybuffer' }
        );

        return {
          name: fileMetadata.data.name,
          mimeType: fileMetadata.data.mimeType,
          data: Buffer.from(response.data)
        };
      } else {
        const response = await this.drive.files.get({
          fileId,
          fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink'
        });
        return response.data;
      }
    } catch (error) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  // Upload file to Google Drive
  async uploadFile({ name, mimeType, data, description, folderId }) {
    try {
      const fileMetadata = {
        name,
        description: description || ''
      };

      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      const bufferStream = new stream.PassThrough();
      bufferStream.end(data);

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType,
          body: bufferStream
        },
        fields: 'id, name, mimeType, size, createdTime, webViewLink'
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Update file in Google Drive
  async updateFile(fileId, { name, description, mimeType, data }) {
    try {
      const fileMetadata = {};
      if (name) fileMetadata.name = name;
      if (description !== undefined) fileMetadata.description = description;

      const params = {
        fileId,
        requestBody: fileMetadata,
        fields: 'id, name, mimeType, size, modifiedTime, webViewLink'
      };

      if (data) {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(data);
        
        params.media = {
          mimeType,
          body: bufferStream
        };
      }

      const response = await this.drive.files.update(params);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update file: ${error.message}`);
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({ fileId });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Find folder by name
  async findFolderByName(folderName) {
    try {
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        pageSize: 1
      });
      
      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0];
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find folder: ${error.message}`);
    }
  }

  // List folders within a parent folder
  async listFoldersInFolder(parentFolderId) {
    try {
      const response = await this.drive.files.list({
        q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name, createdTime, modifiedTime)',
        orderBy: 'name'
      });
      
      return response.data.files || [];
    } catch (error) {
      throw new Error(`Failed to list folders: ${error.message}`);
    }
  }

  // Get first image from a folder
  async getFirstImageFromFolder(folderId) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink)',
        pageSize: 1,
        orderBy: 'createdTime'
      });
      
      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0];
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to get image: ${error.message}`);
    }
  }

  // Get folders with their first image from "3D" folder
  async get3DFoldersWithImages() {
    try {
      // First, find the "3D" folder
      const threeDFolder = await this.findFolderByName('3D');
      
      if (!threeDFolder) {
        throw new Error('3D folder not found');
      }

      // Get all folders inside the "3D" folder
      const folders = await this.listFoldersInFolder(threeDFolder.id);

      // For each folder, get the first image
      const foldersWithImages = await Promise.all(
        folders.map(async (folder) => {
          const image = await this.getFirstImageFromFolder(folder.id);
          return {
            id: folder.id,
            name: folder.name,
            createdTime: folder.createdTime,
            modifiedTime: folder.modifiedTime,
            image: image ? {
              id: image.id,
              name: image.name,
              mimeType: image.mimeType,
              thumbnailLink: image.thumbnailLink,
              webContentLink: image.webContentLink
            } : null
          };
        })
      );

      return foldersWithImages;
    } catch (error) {
      throw new Error(`Failed to get 3D folders: ${error.message}`);
    }
  }

  // Get image as base64 for display
  async getImageAsBase64(fileId) {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      const base64 = Buffer.from(response.data).toString('base64');
      
      // Get mime type
      const metadata = await this.drive.files.get({
        fileId,
        fields: 'mimeType'
      });

      return {
        base64,
        mimeType: metadata.data.mimeType
      };
    } catch (error) {
      throw new Error(`Failed to get image: ${error.message}`);
    }
  }

  // Create a folder
  async createFolder(folderName, parentFolderId) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, createdTime'
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  // Check if folder exists in parent
  async checkFolderExists(folderName, parentFolderId) {
    try {
      const response = await this.drive.files.list({
        q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        pageSize: 1
      });
      
      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0];
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to check folder: ${error.message}`);
    }
  }

  // Create "uploads" folder in a 3D subfolder
  async createUploadsFolderInFolder(folderId, folderName) {
    try {
      // Check if uploads folder already exists
      const existingFolder = await this.checkFolderExists('uploads', folderId);
      
      if (existingFolder) {
        return {
          folder: existingFolder,
          created: false,
          message: `Uploads folder already exists in ${folderName}`
        };
      }

      // Create the uploads folder
      const newFolder = await this.createFolder('uploads', folderId);
      
      return {
        folder: newFolder,
        created: true,
        message: `Uploads folder created in ${folderName}`
      };
    } catch (error) {
      throw new Error(`Failed to create uploads folder: ${error.message}`);
    }
  }

  // Check if text file exists in folder
  async checkTextFileExists(fileName, parentFolderId) {
    try {
      const response = await this.drive.files.list({
        q: `name='${fileName}' and '${parentFolderId}' in parents and mimeType='text/plain' and trashed=false`,
        fields: 'files(id, name)',
        pageSize: 1
      });
      
      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0];
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to check text file: ${error.message}`);
    }
  }

  // Read text file content
  async readTextFile(fileId) {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'text' }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to read text file: ${error.message}`);
    }
  }

  // Create or update text file
  async createOrUpdateTextFile(fileName, content, parentFolderId) {
    try {
      // Check if file exists
      const existingFile = await this.checkTextFileExists(fileName, parentFolderId);
      
      if (existingFile) {
        // Update existing file
        const response = await this.drive.files.update({
          fileId: existingFile.id,
          media: {
            mimeType: 'text/plain',
            body: content
          },
          fields: 'id, name, modifiedTime'
        });
        
        return {
          file: response.data,
          created: false,
          message: 'Description updated successfully'
        };
      } else {
        // Create new file
        const fileMetadata = {
          name: fileName,
          mimeType: 'text/plain',
          parents: [parentFolderId]
        };

        const response = await this.drive.files.create({
          requestBody: fileMetadata,
          media: {
            mimeType: 'text/plain',
            body: content
          },
          fields: 'id, name, createdTime'
        });
        
        return {
          file: response.data,
          created: true,
          message: 'Description created successfully'
        };
      }
    } catch (error) {
      throw new Error(`Failed to create/update text file: ${error.message}`);
    }
  }

  // Get description for a folder
  async getFolderDescription(folderId) {
    try {
      const descFile = await this.checkTextFileExists('Discription.txt', folderId);
      
      if (descFile) {
        const content = await this.readTextFile(descFile.id);
        return content;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting folder description:', error);
      return null;
    }
  }

  // Get folders with their first image from "3D" folder (updated with descriptions)
  async get3DFoldersWithImages() {
    try {
      // First, find the "3D" folder
      const threeDFolder = await this.findFolderByName('3D');
      
      if (!threeDFolder) {
        throw new Error('3D folder not found');
      }

      // Get all folders inside the "3D" folder
      const folders = await this.listFoldersInFolder(threeDFolder.id);

      // For each folder, get the first image and description
      const foldersWithImages = await Promise.all(
        folders.map(async (folder) => {
          const [image, description] = await Promise.all([
            this.getFirstImageFromFolder(folder.id),
            this.getFolderDescription(folder.id)
          ]);
          
          return {
            id: folder.id,
            name: folder.name,
            createdTime: folder.createdTime,
            modifiedTime: folder.modifiedTime,
            description: description || null,
            image: image ? {
              id: image.id,
              name: image.name,
              mimeType: image.mimeType,
              thumbnailLink: image.thumbnailLink,
              webContentLink: image.webContentLink
            } : null
          };
        })
      );

      return foldersWithImages;
    } catch (error) {
      throw new Error(`Failed to get 3D folders: ${error.message}`);
    }
  }
}

module.exports = new DriveService();


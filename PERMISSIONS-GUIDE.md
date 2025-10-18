# Google Drive Permissions Guide

## The Problem

Service accounts **cannot create files in their own storage** - they don't have Google Drive storage space. They can only:
- ✅ Read files/folders that have been shared with them
- ✅ Create/Edit files in folders that have been shared with **Editor** permissions
- ❌ Create files without proper folder permissions

## The Solution

You need to share your Google Drive folders with the service account and grant **Editor** permissions.

### Service Account Email:
```
tr11-142@trailers-475407.iam.gserviceaccount.com
```

## Step-by-Step Instructions

### 1. Share the "3D" Folder

1. Open [Google Drive](https://drive.google.com/)
2. Find your **"3D"** folder (the main folder containing all trailer folders)
3. **Right-click** on the "3D" folder
4. Click **"Share"**
5. In the "Add people and groups" field, paste:
   ```
   tr11-142@trailers-475407.iam.gserviceaccount.com
   ```
6. In the permissions dropdown, select **"Editor"** (not Viewer!)
7. **Uncheck** "Notify people" (service accounts don't need notifications)
8. Click **"Share"** or **"Send"**

### 2. Share Individual Trailer Folders (if needed)

If you still get permission errors for specific folders:

1. Right-click on each trailer folder inside "3D"
2. Click **"Share"**
3. Add the service account email (same as above)
4. Grant **"Editor"** permissions
5. Click **"Share"**

### 3. Verify Permissions

After sharing:
1. Refresh your web application at `http://localhost:3000`
2. Try to edit a description or create an uploads folder
3. It should now work! ✅

## Why "Editor" and not "Viewer"?

- **Viewer**: Can only READ files ❌ Cannot create/edit
- **Editor**: Can READ, CREATE, and EDIT files ✅ Full functionality
- **Owner**: Only available for personal accounts, not service accounts

## Alternative: Use Google Workspace Shared Drive

If you're using Google Workspace, you can use a Shared Drive instead:
1. Create a Shared Drive
2. Add the service account as a member with "Content Manager" or "Manager" role
3. Move your folders to the Shared Drive

This is often better for team environments!

## Troubleshooting

### Error: "Service Accounts do not have storage quota"
- **Cause**: Folder not shared with service account, or shared with "Viewer" only
- **Fix**: Follow steps above to share with "Editor" permissions

### Error: "Permission denied"
- **Cause**: Service account doesn't have Editor access
- **Fix**: Re-share the folder and ensure "Editor" is selected

### Folders load but cannot create/edit
- **Cause**: "3D" folder has correct permissions, but subfolders don't inherit
- **Fix**: Share individual trailer folders with Editor permissions

## Testing

To test if permissions are correctly set:

1. Open your app: `http://localhost:3000`
2. Click "Edit" on any folder
3. Add or modify a description
4. Click "Save"
5. Check Google Drive - you should see "Discription.txt" in that folder

## Security Note

The service account only has access to folders you explicitly share with it. It cannot access any other files in your Google Drive. This is secure and recommended for production use.


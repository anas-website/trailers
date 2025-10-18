# Google Drive Manager

A Node.js web application with Express server that integrates with Google Drive API to manage files. Upload, download, view, and delete files from your Google Drive through a beautiful web interface.

## Features

- 🔐 Service account authentication with Google Drive
- ⬆️ Upload files to Google Drive
- 📥 Download files from Google Drive
- 👁️ View files in Google Drive
- 🗑️ Delete files from Google Drive
- 🔍 Search files by name
- 📱 Responsive design
- 🚀 Ready for Heroku deployment

## Prerequisites

- Node.js (v18 or higher)
- Google Cloud Platform account
- Heroku account (for deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd trailers-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. Create Service Account Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details and click "Create"
   - Grant the service account appropriate roles (optional)
   - Click "Done"
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" and click "Create"
   - Save the downloaded JSON file as `credentials.json` in your project root

5. Share Google Drive folder with service account:
   - Open Google Drive
   - Right-click on the folder you want to access
   - Click "Share"
   - Add the service account email (found in credentials.json as `client_email`)
   - Grant appropriate permissions (Viewer, Editor, etc.)

### 4. Configure Environment Variables

1. Create `.env` file with your credentials:
   ```bash
   cp env.example .env
   ```

2. Run the helper script to populate your `.env` file:
   ```bash
   node get-heroku-credentials.js
   ```
   Copy the JSON output and add it to your `.env` file as:
   ```
   PORT=3000
   
   GOOGLE_CREDENTIALS=<paste_json_here>
   ```

**Note:** The app will automatically use credentials from:
- `.env` file for local development (via `GOOGLE_CREDENTIALS` variable)
- `credentials.json` file as fallback if environment variable is not set
- Heroku environment variables in production

### 5. Test the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and go to `http://localhost:3000`

3. Test the application:

   - The gallery will automatically load folders from the "3D" folder in your Google Drive
   - Click on any folder to open it in Google Drive
   - Use the Edit button to add descriptions to folders
   - Use the "Create Uploads" button to create an uploads folder inside any trailer folder

## Project Structure

```
trailers-web/
├── controllers/
│   └── driveController.js       # Request handlers for Drive operations
├── routes/
│   └── driveRoutes.js           # API route definitions
├── services/
│   └── driveService.js          # Google Drive API integration
├── public/
│   ├── index.html               # Main gallery page with inline JavaScript
│   └── styles.css               # Styles
├── server.js                    # Express server setup
├── get-heroku-credentials.js    # Helper script for Heroku deployment
├── package.json                 # Dependencies
├── Procfile                     # Heroku process file
├── app.json                     # Heroku app configuration
├── .gitignore                   # Git ignore file
├── env.example                  # Environment variables template
├── HEROKU-SETUP.md              # Heroku deployment guide
└── README.md                    # This file
```

## API Endpoints

### File Operations
- `GET /api/drive/files` - List files from Google Drive
  - Query params: `pageSize`, `pageToken`, `query`
- `GET /api/drive/files/:fileId` - Get file metadata or download
  - Query params: `download=true` to download the file
- `POST /api/drive/upload` - Upload file to Google Drive
  - Form data: `file`, `name` (optional), `description` (optional)
- `PUT /api/drive/files/:fileId` - Update file in Google Drive
  - Form data: `file` (optional), `name` (optional), `description` (optional)
- `DELETE /api/drive/files/:fileId` - Delete file from Google Drive

### 3D Gallery Operations
- `GET /api/drive/3d-folders` - Get all folders from "3D" folder with their first image
- `GET /api/drive/image/:fileId` - Get image as base64
- `POST /api/drive/create-uploads-folder` - Create uploads folder in a 3D subfolder
- `POST /api/drive/save-description` - Save or update description for a folder

## Deploying to Heroku

### Method 1: Using Heroku CLI

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Set up Google credentials on Heroku:
   
   **Option 1: Using the helper script (Recommended)**
   ```bash
   node get-heroku-credentials.js
   ```
   This will output a `heroku config:set` command that you can copy and run.
   
   **Option 2: Manual setup via Heroku CLI**
   ```bash
   heroku config:set GOOGLE_CREDENTIALS="$(cat credentials.json | tr -d '\n')"
   ```
   
   **Option 3: Via Heroku Dashboard**
   - Go to your app's Settings tab
   - Click "Reveal Config Vars"
   - Add a new config var:
     - Key: `GOOGLE_CREDENTIALS`
     - Value: Copy the entire contents of `credentials.json` (as a single line)

5. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

6. Deploy to Heroku:
   ```bash
   git push heroku main
   ```
   (If your branch is `master`, use `git push heroku master`)

7. Open your app:
   ```bash
   heroku open
   ```

### Method 2: Using Heroku Dashboard

1. Go to [Heroku Dashboard](https://dashboard.heroku.com/)
2. Click "New" > "Create new app"
3. Choose an app name and region
4. Go to "Settings" tab
5. Click "Reveal Config Vars"
6. Add a new config var:
   - Key: `GOOGLE_CREDENTIALS`
   - Value: Run `node get-heroku-credentials.js` locally and copy the JSON output
7. Go to "Deploy" tab
8. Connect your GitHub repository
9. Click "Deploy Branch"

### Important Notes for Heroku Deployment

- The app will automatically use the `GOOGLE_CREDENTIALS` environment variable on Heroku
- For local development, it will fall back to the `credentials.json` file
- Make sure the service account has access to your Google Drive folders
- For security, never commit `credentials.json` to public repositories
- The `credentials.json` file should remain in `.gitignore`

## Development

Run the app in development mode with auto-restart:

```bash
npm run dev
```

## Troubleshooting

### "No credentials found" error
- **For local development**: Make sure `credentials.json` is in the project root directory
- **For Heroku**: Make sure `GOOGLE_CREDENTIALS` environment variable is set
- Run `node get-heroku-credentials.js` to get the proper format for Heroku
- Verify the JSON is valid (no syntax errors)

### "3D folder not found" error
- Create a folder named "3D" in your Google Drive
- Share the folder with the service account email
- Verify the service account has proper permissions

### Files not loading
- Verify the service account has access to the folders
- Make sure Google Drive API is enabled
- Check that credentials.json is valid
- Check server logs for detailed error messages

### Heroku deployment issues
- Make sure all environment variables are set
- Check Heroku logs: `heroku logs --tail`
- Ensure Node.js version is compatible (specified in package.json)

## Security Notes

- Never commit `.env` or `credentials.json` files to public repositories
- Keep your service account credentials secure
- Use environment variables or secure storage for sensitive data
- For production, consider implementing user authentication
- Implement rate limiting for API endpoints
- Regularly rotate service account keys
- Grant minimum required permissions to the service account

## Technologies Used

- **Backend**: Node.js, Express.js
- **Google APIs**: Google Drive API v3, googleapis npm package
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **File Upload**: Multer
- **Deployment**: Heroku

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or contact the maintainer.

## Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Folder management
- [ ] Sharing files
- [ ] File preview
- [ ] Drag and drop upload
- [ ] Progress bars for uploads/downloads
- [ ] Batch operations
- [ ] Advanced search filters


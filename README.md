# Google Drive Manager

A Node.js web application with Express server that integrates with Google Drive API to manage files. Upload, download, view, and delete files from your Google Drive through a beautiful web interface.

## Features

- 🔐 OAuth2 authentication with Google Drive
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

4. Create OAuth2 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/drive/oauth2callback`
     - For Heroku: `https://your-app-name.herokuapp.com/api/drive/oauth2callback`
   - Click "Create"
   - Save your Client ID and Client Secret

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your Google OAuth2 credentials:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/oauth2callback
   GOOGLE_REFRESH_TOKEN=
   PORT=3000
   ```

### 5. Get Refresh Token

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and go to `http://localhost:3000`

3. Click "Get Authorization URL" button

4. Click the authorization link and grant permissions

5. You'll be redirected back with a refresh token displayed on the page

6. Copy the refresh token and add it to your `.env` file as `GOOGLE_REFRESH_TOKEN`

7. Restart the server

### 6. Test the Application

1. Click "Refresh" button to load your Google Drive files
2. Try uploading a file
3. Test download, view, and delete functions

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
│   ├── index.html               # Main HTML page
│   ├── styles.css               # Styles
│   └── app.js                   # Frontend JavaScript
├── server.js                    # Express server setup
├── package.json                 # Dependencies
├── Procfile                     # Heroku process file
├── app.json                     # Heroku app configuration
├── .gitignore                   # Git ignore file
├── env.example                  # Environment variables template
└── README.md                    # This file
```

## API Endpoints

### Authentication
- `GET /api/drive/auth-url` - Get OAuth2 authorization URL
- `GET /api/drive/oauth2callback` - OAuth2 callback endpoint

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

4. Set environment variables on Heroku:
   ```bash
   heroku config:set GOOGLE_CLIENT_ID=your_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret
   heroku config:set GOOGLE_REDIRECT_URI=https://your-app-name.herokuapp.com/api/drive/oauth2callback
   ```

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

8. Get the refresh token:
   - Follow steps in "Get Refresh Token" section using your Heroku URL
   - Set the refresh token on Heroku:
     ```bash
     heroku config:set GOOGLE_REFRESH_TOKEN=your_refresh_token
     ```

9. Restart the app:
   ```bash
   heroku restart
   ```

### Method 2: Using Heroku Dashboard

1. Go to [Heroku Dashboard](https://dashboard.heroku.com/)
2. Click "New" > "Create new app"
3. Choose an app name and region
4. Go to "Settings" tab
5. Click "Reveal Config Vars"
6. Add all environment variables from `.env` file
7. Go to "Deploy" tab
8. Connect your GitHub repository
9. Click "Deploy Branch"

### Update Google OAuth Redirect URI

Don't forget to add your Heroku app URL to the authorized redirect URIs in Google Cloud Console:
- `https://your-app-name.herokuapp.com/api/drive/oauth2callback`

## Development

Run the app in development mode with auto-restart:

```bash
npm run dev
```

## Troubleshooting

### "Invalid grant" error
- Your refresh token may have expired
- Re-authorize the application to get a new refresh token

### "Invalid client" error
- Check your Client ID and Client Secret
- Make sure they are correctly set in environment variables

### Files not loading
- Check if refresh token is set correctly
- Make sure Google Drive API is enabled
- Check server logs for detailed error messages

### Heroku deployment issues
- Make sure all environment variables are set
- Check Heroku logs: `heroku logs --tail`
- Ensure Node.js version is compatible (specified in package.json)

## Security Notes

- Never commit `.env` file to git
- Keep your Client Secret and Refresh Token secure
- Use environment variables for all sensitive data
- For production, consider implementing user authentication
- Implement rate limiting for API endpoints

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


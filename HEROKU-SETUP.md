# Heroku Deployment Instructions

## Quick Setup

### Step 1: Get Your Credentials for Heroku

Run this command in your project directory:
```bash
node get-heroku-credentials.js
```

This will output the credentials in the correct format for Heroku.

### Step 2: Set Environment Variable in Heroku

#### Option A: Using Heroku CLI
Copy and run the `heroku config:set` command from the script output:
```bash
heroku config:set GOOGLE_CREDENTIALS='<json_from_script>'
```

#### Option B: Using Heroku Dashboard
1. Go to https://dashboard.heroku.com/
2. Select your app
3. Go to **Settings** tab
4. Click **Reveal Config Vars**
5. Add a new config var:
   - **Key:** `GOOGLE_CREDENTIALS`
   - **Value:** Copy the JSON value from the script output

### Step 3: Deploy

```bash
git push heroku main
```

## Important Notes

- The `GOOGLE_CREDENTIALS` environment variable must contain the entire service account JSON as a single-line string
- Do NOT commit `.env` or `credentials.json` to your repository
- Make sure your service account has access to your Google Drive folders
- Share the "3D" folder in Google Drive with the service account email: `tr11-142@trailers-475407.iam.gserviceaccount.com`

## Verification

After deployment, check logs:
```bash
heroku logs --tail
```

You should see:
```
Server is running on port <port>
Visit http://localhost:<port>
```

If you see "No credentials found" error, the environment variable wasn't set correctly.

## Troubleshooting

### "No credentials found" error
- Verify `GOOGLE_CREDENTIALS` is set in Heroku Config Vars
- Check that the JSON is valid (no line breaks, proper quotes)
- Run `heroku config:get GOOGLE_CREDENTIALS` to verify

### "3D folder not found" error
- Create a folder named "3D" in your Google Drive
- Share it with: `tr11-142@trailers-475407.iam.gserviceaccount.com`
- Grant Editor or Viewer permissions

### Files not loading
- Verify the service account has access to the folders
- Check that Google Drive API is enabled in Google Cloud Console
- View logs: `heroku logs --tail`


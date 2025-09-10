# Firebase Firestore Export Setup Guide

This guide will help you set up the necessary authentication to export data from your Firebase Firestore database.

## Prerequisites

- Node.js installed on your system
- Access to your Firebase project console
- Admin access to the Firebase project

## Step 1: Install Dependencies

First, install the required dependencies:

```bash
npm install
```

## Step 2: Set Up Service Account Authentication

You have two options for authentication:

### Option A: Service Account Key File (Recommended)

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `xin-s-hall-of-fame`

2. **Navigate to Service Accounts**
   - Click on the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Go to the "Service accounts" tab

3. **Generate New Private Key**
   - Click "Generate new private key"
   - A dialog will appear warning about keeping the key secure
   - Click "Generate key" to download the JSON file

4. **Save the Key File**
   - Save the downloaded file as `service-account-key.json` in your project root
   - **IMPORTANT**: Add this file to your `.gitignore` to keep it secure

5. **Set Environment Variable**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
   ```

### Option B: Environment Variable Only

If you prefer not to store the key file locally:

1. Follow steps 1-3 from Option A
2. Instead of saving the file, copy the contents
3. Set the environment variable with the JSON content:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account","project_id":"xin-s-hall-of-fame",...}'
   ```

## Step 3: Update .gitignore

Add the service account key file to your `.gitignore`:

```gitignore
# Firebase service account keys
service-account-key.json
*.json
!firebase-config.js
!package.json
!package-lock.json
```

## Step 4: Run the Export Script

Once authentication is set up, run the export script:

```bash
node export-firestore.js
```

The script will:
- Connect to your Firestore database
- Export all collections and documents
- Save the data to a timestamped JSON file (e.g., `firestore-export-2024-01-15T10-30-45-123Z.json`)

## Usage Examples

### Basic Export
```bash
node export-firestore.js
```

### With Custom Service Account Key
```bash
GOOGLE_APPLICATION_CREDENTIALS=./my-key.json node export-firestore.js
```

### Show Help
```bash
node export-firestore.js --help
```

### Show Version
```bash
node export-firestore.js --version
```

## Output

The script will create a JSON file with the following structure:

```json
{
  "collection1": {
    "document1": {
      "field1": "value1",
      "field2": "value2"
    },
    "document2": {
      "field1": "value1"
    }
  },
  "collection2": {
    "document1": {
      "field1": "value1"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Failed to initialize Firebase Admin SDK"**
   - Ensure you have set up the service account key correctly
   - Check that the `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set
   - Verify the service account has the necessary permissions

2. **"Permission denied" errors**
   - Ensure the service account has "Cloud Datastore User" or "Firebase Admin" role
   - Check that your Firebase project is active and accessible

3. **"Project not found" errors**
   - Verify the project ID in the script matches your Firebase project
   - Ensure you're using the correct service account key

### Getting Help

- Run `node export-firestore.js --help` for usage information
- Check the Firebase Console for project settings and permissions
- Review the Firebase Admin SDK documentation for advanced configuration

## Security Notes

- **Never commit service account keys to version control**
- Store service account keys securely
- Rotate keys regularly
- Use environment variables in production environments
- Consider using Firebase App Check for additional security

## Next Steps

After successful export:
1. Review the exported JSON file
2. Use the data for backup, migration, or analysis
3. Consider setting up automated exports for regular backups
4. Implement data validation if needed

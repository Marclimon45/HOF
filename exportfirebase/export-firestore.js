#!/usr/bin/env node

/**
 * Firebase Firestore Export Script
 * Downloads all collections and documents from Firestore as JSON
 * 
 * Usage:
 * 1. Set up service account key (see README)
 * 2. Run: node export-firestore.js
 * 3. Check firestore-export.json for the exported data
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin SDK
// You can either use a service account key file or set GOOGLE_APPLICATION_CREDENTIALS
let app;

try {
  // Try to initialize with default credentials (service account key)
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "xin-s-hall-of-fame" // Your project ID from firebase-config.js
  });
  console.log("✅ Firebase Admin SDK initialized with service account key");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:");
  console.error("Please ensure you have set up a service account key file.");
  console.error("See the setup instructions in the README or run: node export-firestore.js --help");
  process.exit(1);
}

const db = admin.firestore();

/**
 * Export all collections from Firestore to JSON
 */
async function exportAllCollections() {
  try {
    console.log("🔄 Starting Firestore export...");
    
    const collections = await db.listCollections();
    const allData = {};
    
    console.log(`📁 Found ${collections.length} collections to export`);
    
    for (const collection of collections) {
      console.log(`📂 Exporting collection: ${collection.id}`);
      
      try {
        const snapshot = await collection.get();
        allData[collection.id] = {};
        
        if (snapshot.empty) {
          console.log(`   ⚠️  Collection '${collection.id}' is empty`);
          allData[collection.id] = {};
        } else {
          snapshot.forEach(doc => {
            allData[collection.id][doc.id] = doc.data();
          });
          console.log(`   ✅ Exported ${snapshot.size} documents from '${collection.id}'`);
        }
      } catch (collectionError) {
        console.error(`   ❌ Error exporting collection '${collection.id}':`, collectionError.message);
        allData[collection.id] = { error: collectionError.message };
      }
    }
    
    // Create export filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `firestore-export-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);
    
    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(allData, null, 2));
    
    console.log(`\n✅ Export completed successfully!`);
    console.log(`📄 Data exported to: ${filename}`);
    console.log(`📊 Total collections: ${Object.keys(allData).length}`);
    
    // Show summary
    Object.keys(allData).forEach(collectionName => {
      const docCount = Object.keys(allData[collectionName]).length;
      if (allData[collectionName].error) {
        console.log(`   ${collectionName}: ❌ Error - ${allData[collectionName].error}`);
      } else {
        console.log(`   ${collectionName}: ${docCount} documents`);
      }
    });
    
  } catch (error) {
    console.error("❌ Export failed:", error.message);
    process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Firebase Firestore Export Script

USAGE:
  node export-firestore.js [options]

OPTIONS:
  --help, -h     Show this help message
  --version, -v  Show version information

SETUP REQUIRED:
  1. Go to Firebase Console > Project Settings > Service Accounts
  2. Click "Generate new private key" to download service account key
  3. Save the key file as 'service-account-key.json' in this directory
  4. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable

ENVIRONMENT VARIABLES:
  GOOGLE_APPLICATION_CREDENTIALS  Path to service account key file

EXAMPLES:
  node export-firestore.js
  GOOGLE_APPLICATION_CREDENTIALS=./key.json node export-firestore.js
`);
}

/**
 * Show version information
 */
function showVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log(`Firestore Export Script v${packageJson.version}`);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  showVersion();
  process.exit(0);
}

// Run the export
exportAllCollections()
  .then(() => {
    console.log("\n🎉 Export process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Export process failed:", error.message);
    process.exit(1);
  });

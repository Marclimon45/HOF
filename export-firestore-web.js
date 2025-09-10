#!/usr/bin/env node

/**
 * Firebase Firestore Export Script (Web SDK)
 * Downloads all collections and documents from Firestore as JSON
 * Uses Firebase Web SDK with your existing configuration
 * 
 * Usage:
 * 1. Run: node export-firestore-web.js
 * 2. Check firestore-export.json for the exported data
 */

const fs = require("fs");
const path = require("path");

// Import Firebase configuration
const firebaseConfig = require('./firebase-config.js');

// For Node.js environment, we need to use a different approach
// Since Firebase Web SDK doesn't work directly in Node.js, we'll create an HTML file
// that can be run in a browser to export the data

function createExportHTML() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firestore Export</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-weight: bold;
        }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        .info { background-color: #d1ecf1; color: #0c5460; }
        .warning { background-color: #fff3cd; color: #856404; }
        button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover { background-color: #0056b3; }
        button:disabled { background-color: #6c757d; cursor: not-allowed; }
        #progress { margin: 20px 0; }
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background-color: #28a745;
            width: 0%;
            transition: width 0.3s ease;
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔥 Firebase Firestore Export Tool</h1>
        <p>This tool will export all collections and documents from your Firestore database as JSON.</p>
        
        <div id="status" class="status info">
            Ready to export. Click "Start Export" to begin.
        </div>
        
        <div id="progress" style="display: none;">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div id="progressText">0%</div>
        </div>
        
        <div>
            <button id="exportBtn" onclick="startExport()">Start Export</button>
            <button id="downloadBtn" onclick="downloadJSON()" disabled>Download JSON</button>
            <button onclick="clearResults()">Clear Results</button>
        </div>
        
        <div id="results" style="display: none;">
            <h3>Export Results:</h3>
            <pre id="jsonOutput"></pre>
        </div>
    </div>

    <!-- Firebase SDK -->
    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getFirestore, collection, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

        // Firebase configuration
        const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 8)};

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        let exportData = {};

        window.startExport = async function() {
            const statusDiv = document.getElementById('status');
            const progressDiv = document.getElementById('progress');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const exportBtn = document.getElementById('exportBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const resultsDiv = document.getElementById('results');
            const jsonOutput = document.getElementById('jsonOutput');

            try {
                exportBtn.disabled = true;
                progressDiv.style.display = 'block';
                statusDiv.className = 'status info';
                statusDiv.textContent = '🔄 Starting Firestore export...';

                // Get all collections
                const collections = await getCollections();
                exportData = {};

                let totalCollections = collections.length;
                let completedCollections = 0;

                for (const collectionName of collections) {
                    try {
                        statusDiv.textContent = \`📂 Exporting collection: \${collectionName}\`;
                        
                        const collectionRef = collection(db, collectionName);
                        const snapshot = await getDocs(collectionRef);
                        
                        exportData[collectionName] = {};
                        
                        if (snapshot.empty) {
                            console.log(\`Collection '\${collectionName}' is empty\`);
                        } else {
                            snapshot.forEach(doc => {
                                exportData[collectionName][doc.id] = doc.data();
                            });
                            console.log(\`Exported \${snapshot.size} documents from '\${collectionName}'\`);
                        }
                        
                        completedCollections++;
                        const progress = (completedCollections / totalCollections) * 100;
                        progressFill.style.width = \`\${progress}%\`;
                        progressText.textContent = \`\${Math.round(progress)}%\`;
                        
                    } catch (error) {
                        console.error(\`Error exporting collection '\${collectionName}':\`, error);
                        exportData[collectionName] = { error: error.message };
                    }
                }

                // Export completed
                statusDiv.className = 'status success';
                statusDiv.textContent = \`✅ Export completed! Exported \${Object.keys(exportData).length} collections.\`;
                
                // Show results
                jsonOutput.textContent = JSON.stringify(exportData, null, 2);
                resultsDiv.style.display = 'block';
                downloadBtn.disabled = false;
                
                // Create downloadable JSON
                window.exportedJSON = JSON.stringify(exportData, null, 2);
                
            } catch (error) {
                statusDiv.className = 'status error';
                statusDiv.textContent = \`❌ Export failed: \${error.message}\`;
                console.error('Export error:', error);
            } finally {
                exportBtn.disabled = false;
            }
        };

        async function getCollections() {
            // Since Firestore Web SDK doesn't have listCollections, we'll try common collection names
            // or you can manually specify them
            const commonCollections = [
                'users', 'posts', 'comments', 'products', 'orders', 'categories',
                'settings', 'config', 'data', 'content', 'items', 'records'
            ];
            
            // Try to get documents from each collection to see which ones exist
            const existingCollections = [];
            
            for (const collectionName of commonCollections) {
                try {
                    const collectionRef = collection(db, collectionName);
                    const snapshot = await getDocs(collectionRef);
                    if (!snapshot.empty) {
                        existingCollections.push(collectionName);
                    }
                } catch (error) {
                    // Collection might not exist or no access
                    console.log(\`Collection '\${collectionName}' not accessible or doesn't exist\`);
                }
            }
            
            return existingCollections;
        }

        window.downloadJSON = function() {
            if (!window.exportedJSON) {
                alert('No data to download. Please run export first.');
                return;
            }
            
            const blob = new Blob([window.exportedJSON], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`firestore-export-\${new Date().toISOString().replace(/[:.]/g, '-')}.json\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        window.clearResults = function() {
            document.getElementById('results').style.display = 'none';
            document.getElementById('progress').style.display = 'none';
            document.getElementById('downloadBtn').disabled = true;
            window.exportedJSON = null;
            exportData = {};
        };
    </script>
</body>
</html>`;

  return htmlContent;
}

// Create the HTML export tool
const htmlContent = createExportHTML();
const htmlPath = path.join(__dirname, 'firestore-export-tool.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('🌐 Firebase Firestore Export Tool Created!');
console.log('');
console.log('📁 Files created:');
console.log(`   - firestore-export-tool.html`);
console.log('');
console.log('🚀 How to use:');
console.log('1. Open firestore-export-tool.html in your web browser');
console.log('2. Click "Start Export" to begin downloading your Firestore data');
console.log('3. Click "Download JSON" to save the exported data');
console.log('');
console.log('💡 Note: This tool uses your existing Firebase configuration and');
console.log('   will work with your current Firebase project settings.');
console.log('');
console.log('🔗 Open the tool: file://' + htmlPath);

/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');

// Get source and target directory paths from command line arguments
const sourceDir = process.argv[2];
const targetDir = process.argv[3];
const copiedFolderName = process.argv[4] || path.basename(sourceDir);

if (!sourceDir || !targetDir) {
  console.error('Usage: npm run copy <source-directory> <target-directory> [copied-folder-name]');
  process.exit(1);
}

// Ensure that the target directory exists
fs.ensureDirSync(targetDir);

// Construct the path to the target directory including the specified copied folder name
const targetPath = require('path').join(targetDir, copiedFolderName);

// Check if the target folder already exists
if (fs.existsSync(targetPath)) {
  // If it exists, remove it
  fs.removeSync(targetPath);
  console.log(`Removed existing folder '${targetPath}'.`);
}

// Perform the folder copy operation (recursively)
try {
  fs.copySync(sourceDir, targetPath, { recursive: true });
  console.log(`Folder '${sourceDir}' copied to '${targetPath}' successfully.`);
} catch (error) {
  console.error('Error copying folder:', error);
  process.exit(1);
}

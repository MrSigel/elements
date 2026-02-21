const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'vid.mp4');
const destDir = path.join(__dirname, 'public');
const destFile = path.join(destDir, 'vid.mp4');
const logFile = path.join(__dirname, 'copy-video.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(logFile, logMsg);
  console.log(msg);
}

try {
  log('Starting video copy process...');
  log(`Source: ${sourceFile}`);
  log(`Destination: ${destFile}`);
  
  // Check if source exists
  if (!fs.existsSync(sourceFile)) {
    log('ERROR: Source file does not exist!');
    process.exit(1);
  }
  log('Source file found');

  // Create public directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    log('Created public directory');
  } else {
    log('Public directory already exists');
  }

  // Copy video file
  fs.copyFileSync(sourceFile, destFile);
  log('Video copied successfully');
  
  // Verify
  if (fs.existsSync(destFile)) {
    const stats = fs.statSync(destFile);
    log(`Verification SUCCESS: File exists (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    log('Verification FAILED: File was not created');
  }
} catch (err) {
  log(`ERROR: ${err.message}`);
  process.exit(1);
}

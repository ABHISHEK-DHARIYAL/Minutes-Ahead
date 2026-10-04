/**
 * Auto-Watcher Script for Minutes Ahead
 * 
 * Watches `frontend/src` for any changes and automatically triggers
 * the static build and sync to `frontend/public/index.html`.
 */

const fs = require('fs');
const path = require('path');
const { buildAndSync } = require('./build-static');

const frontendDir = path.resolve(__dirname, '..');
const srcDir = path.join(frontendDir, 'src');

let isBuilding = false;
let queuedBuild = false;
let debounceTimer = null;
const DEBOUNCE_MS = 600;

function triggerBuild(reason) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;

    if (isBuilding) {
      console.log(`[Watcher] Build already in progress. Queued next build (${reason}).`);
      queuedBuild = true;
      return;
    }

    runBuild(reason);
  }, DEBOUNCE_MS);
}

function runBuild(reason) {
  isBuilding = true;
  console.log(`\n[Watcher] ⚡ Detected changes: ${reason}`);
  
  try {
    buildAndSync();
  } catch (err) {
    console.error('[Watcher] Build failed with error:', err.message);
  } finally {
    isBuilding = false;
    if (queuedBuild) {
      queuedBuild = false;
      console.log('[Watcher] Running queued build...');
      runBuild('queued changes');
    }
  }
}

// 1. Initial build on startup
console.log('======================================================');
console.log('[Minutes Ahead Watcher] Initializing static watcher...');
console.log(`[Minutes Ahead Watcher] Watching directory: ${srcDir}`);
console.log('======================================================');

runBuild('initial startup');

// 2. Watch src directory
if (!fs.existsSync(srcDir)) {
  console.error(`[Watcher] Error: Directory ${srcDir} does not exist.`);
  process.exit(1);
}

try {
  fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    // Ignore temporary, swap, and hidden files
    const basename = path.basename(filename);
    if (
      basename.startsWith('.') ||
      basename.endsWith('~') ||
      basename.endsWith('.tmp') ||
      basename.endsWith('.swp')
    ) {
      return;
    }

    triggerBuild(`${eventType} on src/${filename}`);
  });
} catch (err) {
  console.error('[Watcher] Error setting up directory watch:', err.message);
  process.exit(1);
}

// 3. Also watch next.config.ts if present
const nextConfigFile = path.join(frontendDir, 'next.config.ts');
if (fs.existsSync(nextConfigFile)) {
  try {
    fs.watch(nextConfigFile, (eventType) => {
      triggerBuild(`${eventType} on next.config.ts`);
    });
  } catch (err) {
    // optional watch
  }
}

console.log(`[Watcher] 👁️  Actively watching frontend/src for edits...`);
console.log(`[Watcher] Press Ctrl+C at any time to stop.`);

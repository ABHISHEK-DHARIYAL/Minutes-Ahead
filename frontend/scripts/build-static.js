/**
 * Static Build and Public Sync Script for Minutes Ahead
 * 
 * Compiles the React/Next.js UI in `frontend/src` into static files
 * and copies the output directly into `frontend/public/index.html` and
 * `frontend/public/next_static/` so that Live Server displays the latest UI.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const frontendDir = path.resolve(__dirname, '..');
const outDir = path.join(frontendDir, 'out');
const publicDir = path.join(frontendDir, 'public');
const nextStaticDir = path.join(publicDir, 'next_static');

function buildAndSync() {
  const startTime = Date.now();
  console.log('\n======================================================');
  console.log(`[Minutes Ahead] 🔨 Building static export from src...`);
  console.log(`[Minutes Ahead] Time: ${new Date().toLocaleTimeString()}`);
  console.log('======================================================');

  // Backup original static index.html if not already backed up
  const publicIndex = path.join(publicDir, 'index.html');
  const legacyIndex = path.join(publicDir, 'index.legacy.html');
  if (fs.existsSync(publicIndex) && !fs.existsSync(legacyIndex)) {
    try {
      fs.copyFileSync(publicIndex, legacyIndex);
      console.log(`[Minutes Ahead] 💾 Backed up legacy index.html to public/index.legacy.html`);
    } catch (err) {
      console.warn(`[Minutes Ahead] ⚠️ Could not backup legacy index.html:`, err.message);
    }
  }

  // Run next build with STATIC_EXPORT=true
  const isWindows = process.platform === 'win32';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';

  const buildResult = spawnSync(npxCmd, ['next', 'build'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      STATIC_EXPORT: 'true'
    }
  });

  if (buildResult.status !== 0) {
    console.error(`\n[Minutes Ahead] ❌ Build failed with exit code ${buildResult.status}`);
    return false;
  }

  if (!fs.existsSync(outDir)) {
    console.error(`\n[Minutes Ahead] ❌ 'out' directory not found after build.`);
    return false;
  }

  console.log(`\n[Minutes Ahead] 🔄 Syncing compiled files into frontend/public...`);

  // Ensure public/next_static exists
  if (!fs.existsSync(nextStaticDir)) {
    fs.mkdirSync(nextStaticDir, { recursive: true });
  }

  // 1. Copy out/_next to public/next_static/_next
  const outNextDir = path.join(outDir, '_next');
  const destNextDir = path.join(nextStaticDir, '_next');
  if (fs.existsSync(outNextDir)) {
    // Remove existing destination first to ensure clean state
    if (fs.existsSync(destNextDir)) {
      fs.rmSync(destNextDir, { recursive: true, force: true });
    }
    fs.cpSync(outNextDir, destNextDir, { recursive: true });
    console.log(`[Minutes Ahead] ✓ Copied Next.js static bundles to public/next_static/_next`);
  }

  // 2. Read and patch out/index.html with relative paths and base path configuration
  const outIndex = path.join(outDir, 'index.html');
  if (fs.existsSync(outIndex)) {
    let html = fs.readFileSync(outIndex, 'utf8');

    // Inject TURBOPACK_CHUNK_BASE_PATH for reliable relative chunk loading
    const runtimeConfigScript = `<script>window.TURBOPACK_CHUNK_BASE_PATH = "next_static/_next/";</script>`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${runtimeConfigScript}`);
    } else {
      html = runtimeConfigScript + html;
    }

    // Convert root-absolute paths to relative paths so it works whether served from / or /public/
    html = html.replace(/\/next_static\//g, 'next_static/');
    html = html.replace(/href="\/favicon\.ico/g, 'href="favicon.ico');
    html = html.replace(/src="\/logo\.png"/g, 'src="logo.png"');
    html = html.replace(/href="\/logo\.png"/g, 'href="logo.png"');
    html = html.replace(/src="\/logo\.jpg"/g, 'src="logo.jpg"');
    html = html.replace(/src="\/digital-india\.png"/g, 'src="digital-india.png"');
    html = html.replace(/src="\/vayu_mitra\.jpg"/g, 'src="vayu_mitra.jpg"');

    fs.writeFileSync(publicIndex, html, 'utf8');
    console.log(`[Minutes Ahead] ✓ Updated frontend/public/index.html with relative paths`);
  } else {
    console.error(`[Minutes Ahead] ❌ out/index.html was not generated.`);
    return false;
  }

  // Ensure image fallback copies exist at root of frontend
  ['logo.png', 'logo.jpg', 'digital-india.png', 'vayu_mitra.jpg'].forEach((img) => {
    const srcPath = path.join(publicDir, img);
    const destPath = path.join(frontendDir, img);
    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (e) {}
    }
  });

  // 3. Create a root frontend/index.html that redirects to public/
  // This ensures opening Live Server from `frontend` redirects straight to the UI
  const rootIndex = path.join(frontendDir, 'index.html');
  const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=public/">
  <title>Minutes Ahead</title>
</head>
<body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b;">
  <div style="text-align: center;">
    <h2 style="color: #2e7d32;">⚡ Minutes Ahead</h2>
    <p>Loading application...</p>
    <p style="font-size: 14px; color: #64748b;">If not redirected automatically, <a href="public/" style="color: #2e7d32; font-weight: bold;">click here to open public/</a></p>
  </div>
  <script>window.location.replace('public/');</script>
</body>
</html>`;
  fs.writeFileSync(rootIndex, redirectHtml, 'utf8');
  console.log(`[Minutes Ahead] ✓ Configured root redirect at frontend/index.html`);

  // 4. Copy out/404.html to public/404.html if exists
  const out404 = path.join(outDir, '404.html');
  if (fs.existsSync(out404)) {
    fs.copyFileSync(out404, path.join(publicDir, '404.html'));
  }

  // 5. Copy favicon if generated in out
  const outFavicon = path.join(outDir, 'favicon.ico');
  if (fs.existsSync(outFavicon)) {
    fs.copyFileSync(outFavicon, path.join(publicDir, 'favicon.ico'));
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('======================================================');
  console.log(`[Minutes Ahead] ✨ SUCCESS! Static output synced in ${durationSec}s.`);
  console.log(`[Minutes Ahead] 🌐 Ready for Live Server: Open frontend/public with Live Server.`);
  console.log('======================================================\n');
  return true;
}

if (require.main === module) {
  const success = buildAndSync();
  process.exit(success ? 0 : 1);
}

module.exports = { buildAndSync };

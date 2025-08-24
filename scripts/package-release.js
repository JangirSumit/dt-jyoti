#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function parseTag() {
  const idx = process.argv.indexOf('--tag');
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  if (process.env.PACKAGE_TAG) return process.env.PACKAGE_TAG;
  return `v${new Date().toISOString().replace(/[:.TZ-]/g, '')}`;
}

const tag = parseTag();
const root = process.cwd();
const deployDir = path.join(root, 'deploy', tag);

console.log('Packaging deploy folder for tag:', tag);

// ensure clean
if (fs.existsSync(deployDir)) {
  console.log('Removing existing deploy dir:', deployDir);
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Run client build (use execSync for cross-platform reliability)
console.log('Running client build (npm run build)');
const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (err) {
  console.error('Client build failed. Aborting.');
  if (err.status) process.exit(err.status);
  process.exit(1);
}

// Helper copy
function copySync(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn('Source not found, skipping:', src);
    return;
  }
  fs.cpSync(src, dest, { recursive: true });
}

// Copy build and server
console.log('Copying build/ and server/ to', deployDir);
copySync(path.join(root, 'build'), path.join(deployDir, 'build'));
copySync(path.join(root, 'server'), path.join(deployDir, 'server'));

// Copy package manifests
console.log('Copying package.json and package-lock.json');
fs.copyFileSync(path.join(root, 'package.json'), path.join(deployDir, 'package.json'));
if (fs.existsSync(path.join(root, 'package-lock.json'))) {
  fs.copyFileSync(path.join(root, 'package-lock.json'), path.join(deployDir, 'package-lock.json'));
}

// Add small deploy README
const info = `This folder is a deployable package for tag: ${tag}\n\nCommands to deploy on the server:\n  cd /path/to/deploy/${tag}\n  npm ci --only=production\n  # set your env variables (PORT, SMTP_*, etc.)\n  npm run start:prod\n`;
fs.writeFileSync(path.join(deployDir, 'README_DEPLOY.txt'), info, 'utf8');

console.log('Deployable folder created at:', deployDir);
console.log('Done. Copy the folder to your server and follow README_DEPLOY.txt');

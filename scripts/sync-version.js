const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const versionFile = path.join(root, 'VERSION');

function readVersion(){
  if (!fs.existsSync(versionFile)) return null;
  return fs.readFileSync(versionFile, 'utf8').trim();
}

function replaceInFile(filePath, regex, replacement){
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content.replace(regex, replacement);
  if (updated !== content){
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Updated:', filePath);
    return true;
  }
  return false;
}

function sync(){
  const version = readVersion();
  if (!version){
    console.error('VERSION file not found');
    process.exit(1);
  }
  console.log('Syncing to version:', version);

  // README and USER_MANUAL: replace Version: X.Y.Z at top
  const readme = path.join(root, 'README.md');
  replaceInFile(readme, /Version:\s*[^\n]+/i, `Version: ${version}`);

  const manual = path.join(root, 'USER_MANUAL.md');
  replaceInFile(manual, /Version:\s*[^\n]+/i, `Version: ${version}`);

  // backend/package.json version field
  const backendPkg = path.join(root, 'backend', 'package.json');
  if (fs.existsSync(backendPkg)){
    const pkg = JSON.parse(fs.readFileSync(backendPkg, 'utf8'));
    if (pkg.version !== version){
      pkg.version = version;
      fs.writeFileSync(backendPkg, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      console.log('Updated backend/package.json to version', version);
    }
  }

  console.log('Sync complete');
}

sync();

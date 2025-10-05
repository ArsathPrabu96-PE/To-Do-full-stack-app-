const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const versionFile = path.join(root, 'VERSION');
const readmeFile = path.join(root, 'README.md');
const manualFile = path.join(root, 'USER_MANUAL.md');
const backendPkgFile = path.join(root, 'backend', 'package.json');

function usage(){
  console.log('Usage: node scripts/release.js <version> "Short release message"');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) usage();
let [versionArg, ...msgParts] = args;
const message = msgParts.join(' ').trim();
if (!versionArg || !message) usage();

// helper to read current VERSION
function readCurrentVersion(){
  if (!fs.existsSync(versionFile)) return '0.0.0';
  return fs.readFileSync(versionFile, 'utf8').trim();
}

// If user passed patch|minor|major, compute next semver
let version = versionArg;
if (/^patch$|^minor$|^major$/i.test(versionArg)){
  const cur = readCurrentVersion();
  const parts = cur.split('.').map(n => parseInt(n,10) || 0);
  while(parts.length < 3) parts.push(0);
  const [maj, min, pat] = parts;
  switch(versionArg.toLowerCase()){
    case 'major': version = `${maj+1}.0.0`; break;
    case 'minor': version = `${maj}.${min+1}.0`; break;
    default: version = `${maj}.${min}.${pat+1}`; break;
  }
  console.log(`Bumping version ${cur} -> ${version}`);
}

function writeVersion(v){
  fs.writeFileSync(versionFile, v + '\n', 'utf8');
  console.log('Wrote VERSION ->', v);
}

function replaceVersionLine(filePath, v){
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  if (/Version:\s*[0-9]+\.[0-9]+\.[0-9]+/i.test(content)){
    content = content.replace(/Version:\s*[^\n]+/i, `Version: ${v}`);
  } else {
    // insert at top
    content = `Version: ${v}\n\n` + content;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated version header in', path.basename(filePath));
}

function prependReleaseNote(filePath, v, msg){
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');

  const noteLine = `- ${v} — ${msg} (${new Date().toISOString().split('T')[0]})`;

  if (/Release notes/i.test(content)){
    // find Release notes header and insert after it
    content = content.replace(/(Release notes\s*\n[-]{0,}\s*)([\s\S]*)/i, (m, h, rest) => {
      // insert new note at top of section
      return h + noteLine + '\n' + rest;
    });
  } else {
    // append a Release notes section at top of file
    content = `Release notes\n---------------------\n${noteLine}\n\n` + content;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Prepended release note to', path.basename(filePath));
}

function updateBackendPkg(v){
  if (!fs.existsSync(backendPkgFile)) return false;
  const pkg = JSON.parse(fs.readFileSync(backendPkgFile, 'utf8'));
  pkg.version = v;
  fs.writeFileSync(backendPkgFile, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('Updated backend/package.json version ->', v);
}

// Run steps
writeVersion(version);
replaceVersionLine(readmeFile, version);
replaceVersionLine(manualFile, version);
prependReleaseNote(readmeFile, version, message);
prependReleaseNote(manualFile, version, message);
updateBackendPkg(version);

console.log('Release update complete.');

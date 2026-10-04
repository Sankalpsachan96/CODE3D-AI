const fs = require('fs');
const cp = require('child_process');

console.log('Running Security Audit...');

// 1. Check tracked files in Git
const trackedFiles = cp.execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
let trackedIssues = [];

const secretPatterns = [
  { name: 'Full Postgres URI with password', regex: /postgres(?:ql)?:\/\/[^:\s'"]+:[^@\s'"]+@[^\s'"]+/i },
  { name: 'Neon API Key', regex: /npg_[a-zA-Z0-9_-]{16,}/ },
  { name: 'Private JWT secret assigned', regex: /JWT_SECRET\s*=\s*['"][a-zA-Z0-9_-]{20,}['"]/ }
];

for (const file of trackedFiles) {
  if (!fs.existsSync(file)) continue;
  // Ignore example files and docs discussing the variable names
  if (file.endsWith('.example') || file.endsWith('.md')) continue;

  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of secretPatterns) {
    if (pattern.regex.test(content)) {
      trackedIssues.push({ file, issue: pattern.name });
    }
  }
}

console.log(`Scanned ${trackedFiles.length} tracked files. Found ${trackedIssues.length} issues in source.`);
if (trackedIssues.length > 0) {
  console.log('Issues found:', trackedIssues);
}

// 2. Check frontend/dist bundle
if (fs.existsSync('frontend/dist')) {
  let bundleIssues = [];
  const distFiles = fs.readdirSync('frontend/dist/assets');
  for (const f of distFiles) {
    const content = fs.readFileSync(`frontend/dist/assets/${f}`, 'utf8');
    if (content.includes('DATABASE_URL') || content.includes('postgresql://') || content.includes('npg_')) {
      bundleIssues.push({ file: f, issue: 'Possible backend credential pattern in bundle' });
    }
  }
  console.log(`Scanned frontend/dist bundle (${distFiles.length} files). Found ${bundleIssues.length} issues.`);
  if (bundleIssues.length > 0) {
    console.log('Bundle issues:', bundleIssues);
  }
}

// 3. Check .gitignore
const rootGitignore = fs.readFileSync('.gitignore', 'utf8');
const backendGitignore = fs.existsSync('backend/.gitignore') ? fs.readFileSync('backend/.gitignore', 'utf8') : '';
const serverGitignore = fs.existsSync('server/.gitignore') ? fs.readFileSync('server/.gitignore', 'utf8') : '';

const ignoresEnv = rootGitignore.includes('.env') &&
  (backendGitignore.includes('.env') || rootGitignore.includes('.env')) &&
  serverGitignore.includes('.env');

console.log('Gitignore properly configured for .env files:', ignoresEnv);

console.log('Security Audit Complete.');

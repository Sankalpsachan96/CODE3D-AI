const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

console.log('Running repository security audit...');

const trackedFiles = cp.execSync('git ls-files', { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
const issues = [];
const secretPatterns = [
  { name: 'PostgreSQL URI containing credentials', regex: /postgres(?:ql)?:\/\/[^:\s'"]+:[^@\s'"]+@[^\\s'"]+/i },
  { name: 'Neon API key', regex: /\bnpg_[a-zA-Z0-9_-]{16,}\b/ },
  { name: 'Hard-coded JWT secret assignment', regex: /\bJWT_SECRET\s*[:=]\s*['"][^'"]{20,}['"]/i },
  { name: 'Hard-coded private key material', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'coverage', '.next']);
const isTextCandidate = (file) => !ignoredDirs.has(file.split('/')[0])
  && !/\.(?:png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf|mp4|mp3)$/i.test(file)
  && !file.endsWith('.md');

for (const file of trackedFiles) {
  if (!isTextCandidate(file) || !fs.existsSync(file)) continue;
  let content;
  try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const pattern of secretPatterns) {
    if (pattern.regex.test(content)) issues.push({ file, issue: pattern.name });
  }
  if (/^\.env(?:\.|$)/.test(path.basename(file)) && !file.endsWith('.env.example')) {
    issues.push({ file, issue: 'Environment file is tracked by Git' });
  }
}

const assetDir = 'frontend/dist/assets';
if (fs.existsSync(assetDir)) {
  for (const file of fs.readdirSync(assetDir)) {
    const fullPath = path.join(assetDir, file);
    if (!fs.statSync(fullPath).isFile()) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    if (/DATABASE_URL|postgres(?:ql)?:\/\/|npg_[a-zA-Z0-9_-]{16,}/i.test(content)) {
      issues.push({ file: fullPath, issue: 'Possible backend credential in frontend bundle' });
    }
  }
}

for (const envPath of ['.env', 'server/.env', 'backend/.env']) {
  const result = cp.spawnSync('git', ['check-ignore', '-q', envPath]);
  if (result.status !== 0) issues.push({ file: envPath, issue: 'Environment path is not ignored by Git' });
}

if (issues.length) {
  console.error(\`Security audit failed with \${issues.length} finding(s):\`);
  for (const item of issues) console.error(\`- \${item.file}: \${item.issue}\`);
  process.exitCode = 1;
} else {
  console.log(\`Security audit passed. Scanned \${trackedFiles.length} tracked files and applicable build assets.\`);
}

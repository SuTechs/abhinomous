// npm run release            → 0.1.0 → 0.1.1
// npm run release -- minor   → 0.1.0 → 0.2.0   (or: major)
//
// Checks the site builds, bumps the version, tags it, pushes main (which a
// connected host like Hostinger redeploys) and creates a GitHub Release with notes.
import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const read = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();
const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const bump = process.argv[2] ?? 'patch';
if (!['patch', 'minor', 'major'].includes(bump)) fail('Use: npm run release [-- patch|minor|major]');
if (read('git branch --show-current') !== 'main') fail('Releases are made from main. Switch to main first.');
if (read('git status --porcelain')) fail('You have uncommitted changes. Commit or stash them first.');

run('git pull --ff-only');
run('npm run build');
const version = read(`npm version ${bump} -m "Release %s"`).split('\n').pop();
run('git push --follow-tags');
run(`gh release create ${version} --title ${version} --generate-notes`);
console.log(`\n✔ Released ${version}. Your host redeploys main in a few minutes.\n`);

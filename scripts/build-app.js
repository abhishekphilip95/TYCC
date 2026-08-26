// Builds the folder that Firebase Hosting uploads for app.tafelbill.com.
//
// Same reasoning as build-admin.js: the repo root holds the admin panel and a
// console helper alongside the POS, so rather than trusting an ignore list to
// keep them out, this copies the files that should be public into an empty
// directory and refuses to continue if anything else turns up there.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'app-dist');

// index.html is served at the domain root. Everything the installed app needs
// is here; the manifest and service worker both use relative paths, so nothing
// changes by moving from a /TYCC/ sub-path to a domain of its own.
const SHIPPED = [
  ['index.html', 'index.html'],
  ['sw.js', 'sw.js'],
  ['manifest.webmanifest', 'manifest.webmanifest'],
  ['icon-192.png', 'icon-192.png'],
  ['icon-512.png', 'icon-512.png'],
  ['icon-maskable-512.png', 'icon-maskable-512.png'],
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const [from, to] of SHIPPED) {
  fs.copyFileSync(path.join(root, from), path.join(out, to));
}

const expected = SHIPPED.map(([, to]) => to);
const shipped = fs.readdirSync(out);
console.log('app-dist contains: ' + shipped.join(', '));

const stray = shipped.filter(f => !expected.includes(f));
if (stray.length) {
  console.error('Refusing to deploy, unexpected files staged: ' + stray.join(', '));
  process.exit(1);
}
if (shipped.includes('admin.html')) {
  console.error('Refusing to deploy: the admin panel must never reach the POS domain.');
  process.exit(1);
}

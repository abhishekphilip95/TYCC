// Builds the folder that Firebase Hosting uploads for admin.tafelbill.com.
//
// The repo root holds the POS, the service worker and a console helper, none
// of which belong on the admin domain. Rather than trusting an ignore list to
// exclude them, this copies the one file that should be public into an empty
// directory, so anything not named here cannot ship by accident.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'admin-dist');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Served at the domain root, so admin.tafelbill.com opens straight into it.
fs.copyFileSync(path.join(root, 'admin.html'), path.join(out, 'index.html'));

// Keep the panel out of search results; it is for staff who know it is there.
fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

const shipped = fs.readdirSync(out);
console.log('admin-dist contains: ' + shipped.join(', '));

const stray = shipped.filter(f => !['index.html', 'robots.txt'].includes(f));
if (stray.length) {
  console.error('Refusing to deploy, unexpected files staged: ' + stray.join(', '));
  process.exit(1);
}

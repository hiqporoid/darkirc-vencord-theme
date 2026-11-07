/* Reproducible local build; Node standard library only. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const parts = fs.readdirSync(path.join(root, 'src')).filter(x => x.endsWith('.css')).sort();
const license = read('licenses/Compact++-BSD-Patent.txt');
// Discord's November build uses a new CSS-module alphabet. Preserve the
// previous selector as a fallback for clients which have not updated yet.
// Each alias remains an exact class, with the same specificity inside :is().
const aliases = JSON.parse(read('src/selector-aliases.json'));
for (const [before, after] of Object.entries(aliases)) {
  if (!/^[A-Za-z][\w-]*$/.test(before) || !Array.isArray(after) || !after.length ||
      after.some(name => !/^[A-Za-z][\w-]*$/.test(name))) throw new Error('Invalid selector alias');
}
const compatible = css => css.replace(/\/\*[\s\S]*?\*\/|\.([A-Za-z][\w-]*)/g, (match, name) =>
  name && Object.hasOwn(aliases, name) ? `:is(.${name}, ${aliases[name].map(x => '.' + x).join(', ')})` : match);
if (!license.includes('DISCLAIMER') || !license.includes('patent license')) throw new Error('Missing upstream license');
const metadata = parts.shift();
const result = read('src/' + metadata).trimEnd() + '\n\n/*\n' + license.trimEnd() + '\n*/\n\n' +
  parts.map(p => '/* ===== ' + p + ' ===== */\n' + compatible(read('src/' + p).trimEnd())).join('\n\n') + '\n';
if (/@import\b|@font-face\b|url\s*\(/i.test(result)) throw new Error('External resource in standalone theme');
fs.writeFileSync(path.join(root, 'DarkIRC.theme.css'), result, 'utf8');
console.log(`Built DarkIRC.theme.css: ${Buffer.byteLength(result)} bytes; ${parts.length} modules + metadata + license`);

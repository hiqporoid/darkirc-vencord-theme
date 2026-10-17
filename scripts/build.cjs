/* Reproducible local build; Node standard library only. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const parts = fs.readdirSync(path.join(root, 'src')).filter(x => x.endsWith('.css')).sort();
const license = read('licenses/Compact++-BSD-Patent.txt');
if (!license.includes('DISCLAIMER') || !license.includes('patent license')) throw new Error('Missing upstream license');
const metadata = parts.shift();
const result = read('src/' + metadata).trimEnd() + '\n\n/*\n' + license.trimEnd() + '\n*/\n\n' +
  parts.map(p => '/* ===== ' + p + ' ===== */\n' + read('src/' + p).trimEnd()).join('\n\n') + '\n';
if (/@import\b|@font-face\b|url\s*\(/i.test(result)) throw new Error('External resource in standalone theme');
fs.writeFileSync(path.join(root, 'DarkIRC.theme.css'), result, 'utf8');
console.log(`Built DarkIRC.theme.css: ${Buffer.byteLength(result)} bytes; ${parts.length} modules + metadata + license`);

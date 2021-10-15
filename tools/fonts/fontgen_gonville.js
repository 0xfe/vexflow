// Creates a new Gonville font using SMuFL key codes

const fs = require('fs');
const process = require('process');
const path = require('path');

function LogError(...args) {
  // eslint-disable-next-line
  console.error(...args)
}

const args = process.argv.slice(2);
if (args.length < 1) {
  LogError('Usage: node gonville_fontgen.js [outdir]');
  LogError('E.g: node fontgen.js /tmp');
  process.exit(255);
}

const outDir = args[0];
const VALID_CODES = require('./config/valid_codes');
const gonvilleGlyphs = require('./fonts/gonville_font');
const customGlyphs = require('./fonts/custom_font');

const gonvilleOutput = {
  ...gonvilleGlyphs,
  glyphs: {}
};

const customOutput = {
  resolution: 1000,
  familyName: 'VexflowCustom',
  glyphs: {}
};

const usedGlyphs = {};
Object.keys(gonvilleGlyphs.glyphs).forEach(g => {
  usedGlyphs[g] = false;
});
Object.keys(customGlyphs.glyphs).forEach(g => {
  usedGlyphs[g] = false;
});

Object.keys(VALID_CODES).forEach((code) => {
  if (!VALID_CODES[code]) {
    LogError('no glyph for: ', code);
    return;
  }

  usedGlyphs[VALID_CODES[code]] = true;

  gonvilleOutput.glyphs[code] = gonvilleGlyphs.glyphs[VALID_CODES[code]];
  customOutput.glyphs[code] = customGlyphs.glyphs[VALID_CODES[code]];
  if (!gonvilleOutput.glyphs[code] && !customOutput.glyphs[code]) {
    LogError('no outline for:', code);
  }
});

LogError('Unused glyphs: ', Object.keys(usedGlyphs).filter(v => !usedGlyphs[v]));

const gonvillePath = path.join(outDir, 'gonville_glyphs.js');
LogError('Writing to file:', gonvillePath);
fs.writeFileSync(gonvillePath, `export const GonvilleFont = ${JSON.stringify(gonvilleOutput, null, 2)};\n`);

const customPath = path.join(outDir, 'custom_glyphs.js');
LogError('Writing to file:', customPath);
fs.writeFileSync(customPath, `export const CustomFont = ${JSON.stringify(customOutput, null, 2)};\n`);

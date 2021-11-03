#!/usr/bin/env node

// Read the gonville.js & custom.js exported fonts from tools/fonts/other/ and generates
// gonville_glyphs.ts and custom_glyphs.ts.
// Translate the legacy VexFlow glyph codes to SMuFL canonical glyph names (e.g., v83 => gClef, v79 => fClef).
//
// Usage: node fontgen_gonville.js ../../src/fonts/

const fs = require('fs');
const process = require('process');
const path = require('path');
const prettier = require('prettier');
const prettierConfig = require('../../.prettierrc.js');

function LogError(...args) {
  // eslint-disable-next-line
  console.error(...args);
}

const args = process.argv.slice(2);
if (args.length < 1) {
  LogError('Usage: node fontgen_gonville.js [outdir]');
  LogError('  e.g: node fontgen_gonville.js /tmp');
  process.exit(255);
}

const outDir = args[0];
const VALID_CODES = require('./config/valid_codes');
const gonvilleGlyphs = require('./other/gonville');
const customGlyphs = require('./other/custom');

const gonvilleOutput = {
  ...gonvilleGlyphs,
  glyphs: {},
};

const customOutput = {
  resolution: 1000,
  fontFamily: 'VexFlowCustom',
  glyphs: {},
};

const usedGlyphs = {};
Object.keys(gonvilleGlyphs.glyphs).forEach((g) => {
  usedGlyphs[g] = false;
});
Object.keys(customGlyphs.glyphs).forEach((g) => {
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

LogError(
  'Unused glyphs: ',
  Object.keys(usedGlyphs).filter((v) => !usedGlyphs[v])
);

// Below, we use our prettier rules to format the output JSON file. See: .prettierrc.js
// That way, if we ever edit & save the file, the diff will be minimal.
// We use String.slice(0, -1) to remove the final newline character.
prettierConfig.parser = 'json5'; // Tell prettier we are parsing JSON.

const gonvillePath = path.join(outDir, 'gonville_glyphs.ts');
LogError('Writing to file:', gonvillePath);
const gonvilleBody = prettier.format(JSON.stringify(gonvilleOutput, null, 2), prettierConfig).slice(0, -1);
fs.writeFileSync(gonvillePath, `export const GonvilleFont = ${gonvilleBody};\n`);

const customPath = path.join(outDir, 'custom_glyphs.ts');
LogError('Writing to file:', customPath);
const customBody = prettier.format(JSON.stringify(customOutput, null, 2), prettierConfig).slice(0, -1);
fs.writeFileSync(customPath, `export const CustomFont = ${customBody};\n`);

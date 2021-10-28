#!/usr/bin/env node

// Convert text font to Vexflow text font metrics.
// Usage: node fontgen_text.js MyFont.otf ../../src/fonts/myfont_glyphs.ts

const fs = require('fs');
const process = require('process');
const opentype = require('opentype.js');
const prettier = require('prettier');
const prettierConfig = require('../../.prettierrc.js');

// eslint-disable-next-line
function LogError(...args) {
  console.error(...args);
}

// Convert OTF glyph path to Vexflow glyph path.
function toVFPath(glyph) {
  const pointSize = 72;
  const scale = 72 * 20;
  const bb = glyph.getBoundingBox();
  const path = glyph.getPath(0, 0, pointSize);
  function fix(f, invert = false) {
    return Math.round((f / pointSize) * scale) * (invert ? -1 : 1);
  }

  return {
    x_min: bb.x1,
    x_max: bb.x2,
    y_min: bb.y1,
    y_max: bb.y2,
    ha: bb.y2 - bb.y1,
    leftSideBearing: glyph.leftSideBearing,
    advanceWidth: glyph.advanceWidth,
  };
}

const args = process.argv.slice(2);
if (args.length < 2) {
  LogError('Usage: node fontgen_text.js [fontfile.otf] [outfile.ts]');
  LogError('e.g:   node fontgen_text.js MyFont.otf myfont_glyphs.ts');
  process.exit(255);
}

const fontFile = args[0];
const outFile = args[1];

const font = opentype.loadSync(fontFile);

const fontData = {};

// Convert metrics for visible ASCII characters in the font.
// This could be adapted to include non-printable characters
// by using a table.
for (let code = 32; code < 127; ++code) {
  const ch = String.fromCharCode(code);
  const glyph = font.charToGlyph(ch);
  fontData[ch] = toVFPath(glyph);
}

// File format for fonts/font_glyphs.js
const fileData = {
  glyphs: fontData,
  fontFamily: font.names.fontFamily.en,
  resolution: font.unitsPerEm,
  generatedOn: new Date().toISOString(),
};

// Set the variable name to the font family name
const fontName = fileData.fontFamily.replace(/\s+/g, '') + 'Font';

// Use our prettier rules to format the output JSON file. See: .prettierrc.js
// That way, if we ever edit & save the file, the diff will be minimal.
// We use String.slice(0, -1) to remove the final newline character.
prettierConfig.parser = 'json5'; // Tell prettier we are parsing JSON.
const body = prettier.format(JSON.stringify(fileData, null, 2), prettierConfig).slice(0, -1);

LogError('Writing to file:', outFile);
fs.writeFileSync(outFile, `export const ${fontName} = ${body};\n`);

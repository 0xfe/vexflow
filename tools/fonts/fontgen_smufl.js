#!/usr/bin/env node

// Convert SMuFL OTF font to Vexflow glyph file.
// Usage: node fontgen_smufl.js Bravura_1.392.otf ../../src/fonts/bravura_glyphs.ts

const fs = require('fs');
const process = require('process');
// eslint-disable-next-line
const opentype = require('opentype.js');
const prettier = require('prettier');
const prettierConfig = require('../../.prettierrc.js');

function LogError(...args) {
  // eslint-disable-next-line
  console.error(...args);
}

// Convert OTF glyph path to Vexflow glyph path
function toVFPath(glyph) {
  const pointSize = 72;
  const scale = 72 * 20;
  const bb = glyph.getBoundingBox();
  const path = glyph.getPath(0, 0, pointSize);
  function fix(f, invert = false) {
    return Math.round((f / pointSize) * scale) * (invert ? -1 : 1);
  }

  const ops = path.commands.map((p) => {
    switch (p.type) {
      case 'M':
        return `m ${fix(p.x)} ${fix(p.y, true)}`;
      case 'L':
        return `l ${fix(p.x)} ${fix(p.y, true)}`;
      case 'C': // Note Vexflow uses 'b' instead of 'c' to represent bezier curves.
        return `b ${fix(p.x)} ${fix(p.y, true)} ${fix(p.x1)} ${fix(p.y1, true)} ${fix(p.x2)} ${fix(p.y2, true)}`;
      case 'Q':
        return `q ${fix(p.x)} ${fix(p.y, true)} ${fix(p.x1)} ${fix(p.y1, true)}`;
      case 'Z':
        return 'z';
      default:
        throw new Error(`unsupported path type: ${p.type}: ${p}`);
    }
  });

  const pathStr = ops.join(' ');

  return {
    x_min: Math.round(bb.x1),
    x_max: Math.round(bb.x2),
    y_min: Math.round(bb.y1),
    y_max: Math.round(bb.y2),
    ha: Math.round(bb.y2 - bb.y1),
    o: pathStr,
  };
}

const args = process.argv.slice(2);
if (args.length < 2) {
  LogError('Usage: node fontgen_smufl.js [fontfile.otf] [outfile.json]');
  LogError('e.g: node fontgen_smufl.js Bravura_1.392.otf bravura_glyphs.ts');
  process.exit(255);
}

const fontFile = args[0];
const outFile = args[1];

const font = opentype.loadSync(fontFile);
const glyphNamesData = fs.readFileSync('./config/glyphnames.json');
const glyphNames = JSON.parse(glyphNamesData);
const VALID_CODES = require('./config/valid_codes');

const fontData = {};

// For each code in VALID_CODES, load the UTF code point from glyphnames.json, look
// it up in the font file, and generate a vexflow path.
Object.keys(VALID_CODES).forEach((k) => {
  const glyphCode = glyphNames[k];
  if (!glyphCode) {
    LogError('Skipping missing glyph:', k);
    return;
  }
  const code = glyphCode.codepoint.substring(2);
  const intCode = String.fromCodePoint(parseInt(code, 16));
  const testGlyph = font.charToGlyphIndex(intCode);
  if (testGlyph === 0) {
    console.log('No glyph for  ' + k);
  } else {
    const glyph = font.charToGlyph(intCode);
    fontData[k] = toVFPath(glyph);
  }
});

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

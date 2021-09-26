// Convert SMuFL OTF font to Vexflow glyph file.
// Usage: node smufl_fontgen.js fonts/Bravura.otf ../../src/fonts/bravura_glyphs.ts

const fs = require('fs');
const process = require('process');
// eslint-disable-next-line
const opentype = require('opentype.js');

function LogError(...args) {
  // eslint-disable-next-line
  console.error(...args);
}

// Convert OTF glyph path to Vexflow glyph path.
function toVFPath(glyph) {
  // TODO: What if we convert it to 1000 pt???
  const pointSize = 72;
  const scale = 20;
  // const pointSize = 1000;
  // const scale = 1;

  const bb = glyph.getBoundingBox();
  const path72 = glyph.getPath(0, 0, pointSize);

  const path1000 = glyph.getPath(0, 0, 1000);
  const pathString1000 = path1000.toPathData(2 /* decimal places */);

  function fix(f, invert = false) {
    return Math.round(f * scale * (invert ? -1 : 1));
  }

  const ops = path72.commands.map((p) => {
    switch (p.type) {
      case 'M':
        return `M ${fix(p.x)} ${fix(p.y, true)}`;
      case 'L':
        return `L ${fix(p.x)} ${fix(p.y, true)}`;
      case 'C':
        return `C ${fix(p.x1)} ${fix(p.y1, true)} ${fix(p.x2)} ${fix(p.y2, true)} ${fix(p.x)} ${fix(p.y, true)}`;
      case 'Q':
        return `Q ${fix(p.x1)} ${fix(p.y1, true)} ${fix(p.x)} ${fix(p.y, true)}`;
      case 'Z':
        return 'Z';
      default:
        throw new Error(`unsupported path type: ${p.type}: ${p}`);
    }
  });

  const pathStringVF = ops.join(' ');

  return {
    x_min: bb.x1,
    x_max: bb.x2,
    y_min: bb.y1,
    y_max: bb.y2,
    ha: bb.y2 - bb.y1, // height of the glyph
    o: pathStringVF, // THE OLD WAY
    d: pathString1000, // THE NEW WAY
  };
}

const args = process.argv.slice(2);
if (args.length < 2) {
  LogError('Usage: node fontgen.js [fontfile.otf] [outfile.json]');
  LogError('E.g: node fontgen.js bravura-v1.otf bravura.smufl.js');
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
    console.log('No glyph for ' + k);
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
const varName = fileData.fontFamily.replace(/\s+/, '_');

LogError('Writing to file:', outFile);
fs.writeFileSync(outFile, `export const ${varName}Font = ${JSON.stringify(fileData, null, 2)};\n`);

const fs = require('fs');
const process = require('process');
const opentype = require('opentype.js');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node gonville_extract_glyphs.js fonts/gonville-18.otf fonts/gonville_font.js');
  process.exit(255);
}

const fontFile = args[0];
const outFile = args[1];

const font = opentype.loadSync(fontFile);
console.log(font);

const fontData = {};

// Yes, it really is font.glyphs.glyphs!
const glyphs = font.glyphs.glyphs;
for (const i in glyphs) {
  const glyph = glyphs[i];
  console.log(glyph);

  const bbox = glyph.getBoundingBox();
  // Get glyphs at 1000 pt, because OTF fonts are designed on a 1000 x 1000 grid.
  const path1000 = glyph.getPath(0, 0, 1000);
  const pathString1000 = path1000.toPathData(2 /* decimal places */);

  fontData[glyph.index] = {
    name: glyph.name,
    unicode: glyph.unicode,
    advanceWidth: glyph.advanceWidth,
    leftSideBearing: glyph.leftSideBearing,
    x_min: bbox.x1,
    x_max: bbox.x2,
    y_min: bbox.y1,
    y_max: bbox.y2,
    d: pathString1000,
    o: doItTheOldWay(glyph),
  };
}

const fileData = {
  glyphs: fontData,
  fontFamily: font.names.fontFamily.en,
  resolution: font.unitsPerEm,
  generatedOn: new Date().toISOString(),
};

// Set the variable name to the font family name
const varName = fileData.fontFamily.replace(/\s+/, '_');

console.error('Writing to file:', outFile);
fs.writeFileSync(outFile, `export const GonvilleFont = ${JSON.stringify(fileData, null, 2)};\n`);

function doItTheOldWay(glyph) {
  const pointSize = 72;
  const scale = 20;

  const path72 = glyph.getPath(0, 0, pointSize);

  function fix(f, invert = false) {
    return Math.round(f * scale * (invert ? -1 : 1));
  }

  const ops = path72.commands.map((p) => {
    switch (p.type) {
      case 'M':
        return `m ${fix(p.x)} ${fix(p.y, true)}`;
      case 'L':
        return `l ${fix(p.x)} ${fix(p.y, true)}`;
      case 'C':
        return `b ${fix(p.x)} ${fix(p.y, true)} ${fix(p.x1)} ${fix(p.y1, true)} ${fix(p.x2)} ${fix(p.y2, true)}`;
      case 'Q':
        return `q ${fix(p.x)} ${fix(p.y, true)} ${fix(p.x1)} ${fix(p.y1, true)}`;
      case 'Z':
        return 'z';
      default:
        throw new Error(`unsupported path type: ${p.type}: ${p}`);
    }
  });

  return ops.join(' ');
}

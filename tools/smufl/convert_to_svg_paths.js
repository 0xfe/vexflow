// Convert bravura_glyph.ts from version 3.0.9 to 4.1.0.
// We need to uppercase the path string and swap around some coordinates in the curve commands.

const fs = require('fs');

const BravuraFont = require('./fonts/3.0.9/bravura_glyphs_3.0.9');
const GonvilleFont = require('./fonts/3.0.9/gonville_glyphs_3.0.9');
const PetalumaFont = require('./fonts/3.0.9/petaluma_glyphs_3.0.9');
const CustomFont = require('./fonts/3.0.9/custom_glyphs_3.0.9');

// Convert path coordinates from version 3.0.9 to version 4.1.0.
// We divide by 1.44 because the old fonts were extracted at 72 pt and then scaled by 20.
// The new paths are extracted at 1000 pt.
// 72 * 20 / 1000 = 1.44. The old paths are 1.44x bigger.
function fixX(x) {
  return Math.round(x / 1.44);
}
// Y values need to be inverted!
function fixY(y) {
  return -Math.round(y / 1.44);
}

function convertFont(fontGlyphs) {
  for (let glyphName in fontGlyphs) {
    const glyph = fontGlyphs[glyphName];

    // In 3.0.9, we stored the outline in o.
    const o = glyph.o.toUpperCase().split(' ');
    // Now, we store the path in d (like in SVG).
    const d = [];
    let i = 0;
    let x, y;
    while (i < o.length) {
      switch (o[i++]) {
        case 'M':
          d.push('M', fixX(o[i++]), fixY(o[i++]));
          break;
        case 'L':
          d.push('L', fixX(o[i++]), fixY(o[i++]));
          break;
        case 'Q':
          x = fixX(o[i++]);
          y = fixY(o[i++]);
          d.push('Q', fixX(o[i++]), fixY(o[i++]), x, y);
          break;
        case 'B': // Convert B to C
          x = fixX(o[i++]);
          y = fixY(o[i++]);
          d.push('C', fixX(o[i++]), fixY(o[i++]), fixX(o[i++]), fixY(o[i++]), x, y);
          break;
        case 'Z':
          d.push('Z');
          break;
      }
    }

    // Don't need spaces in front of minus signs!
    // Remove spaces where possible:
    //   Before minus signs.
    //   Before and/or after MLQCZ.
    // .replace(/\s*([-MLQCZ])\s*/g, '$1');

    glyph.d = d.join(' ');
  }
}

function writeFile(fontData, fontName) {
  fs.writeFileSync(
    `./fonts/4.1.0/${fontName.toLowerCase()}_glyphs.ts`,
    `export const ${fontName}Font = ${JSON.stringify(fontData, null, 2)};\n`
  );
}

convertFont(BravuraFont.glyphs);
convertFont(GonvilleFont.glyphs);
convertFont(PetalumaFont.glyphs);
convertFont(CustomFont.glyphs);

writeFile(BravuraFont, 'Bravura');
writeFile(GonvilleFont, 'Gonville');
writeFile(PetalumaFont, 'Petaluma');
writeFile(CustomFont, 'Custom');

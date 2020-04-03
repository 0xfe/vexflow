const fs = require('fs');
const process = require('process');
// eslint-disable-next-line
const opentype = require('opentype.js');

function toVFPath(glyph) {
  const bb = glyph.getBoundingBox();
  const path = glyph.getPath();
  function fix(f) {
    return Math.round(f * 1000) / 1000;
  }

  const ops = path.commands.map((p) => {
    switch (p.type) {
      case 'M':  return `m ${fix(p.x)} ${fix(p.y)}`;
      case 'L':  return `l ${fix(p.x)} ${fix(p.y)}`;
      case 'C':  return `c ${fix(p.x1)} ${fix(p.y1)} ${fix(p.x2)} ${fix(p.y2)} ${fix(p.x)} ${fix(p.y)}`;
      case 'Q':  return `q ${fix(p.x1)} ${fix(p.y1)} ${fix(p.x)} ${fix(p.y)}`;
      case 'Z':  return 'z';
      default: throw new Error(`unsupported path type: ${p.type}: ${p}`);
    }
  });

  const pathStr = ops.join(' ');

  return {
    'x_min': bb.x1,
    'x_max': bb.x2,
    'y_min': bb.y1,
    'y_max': bb.y2,
    'ha': bb.y2 - bb.y1,
    'o': pathStr,
  };
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node fontgen.js [fontfile.otf] [outfile.json]');
  console.error('E.g: node fontgen.js bravura-v1.otf bravura.smufl.js');
  process.exit(255);
}

const fontFile = args[0];
const outFile = args[1];

const font = opentype.loadSync(fontFile);
const glyphNamesData = fs.readFileSync('glyphnames.json');
const glyphNames = JSON.parse(glyphNamesData);

const fontData = {};
Object.keys(glyphNames).forEach((k) => {
  const code = glyphNames[k].codepoint.substring(2);
  const glyph = font.charToGlyph(String.fromCodePoint(parseInt(code, 16)));
  fontData[k] = toVFPath(glyph);
});

const fileData = {
  glyphs: fontData,
  fontFamily: font.names.fontFamily.en,
  generatedOn: new Date().toISOString(),
};

const varName = fileData.fontFamily.replace(/\s+/, '_');

fs.writeFileSync(outFile, `export default ${varName}Font = ${JSON.stringify(fileData)};\n`);

const { JSDOM } = require('jsdom');
const { registerFont, createCanvas } = require('canvas');
registerFont('../../tools/woff/bravura/Bravura_1.392.woff', { family: 'Bravura' });
registerFont('../../tools/woff/petaluma/Petaluma_1.065.woff', { family: 'Petaluma' });
registerFont('../../tools/woff/petaluma/PetalumaScript_1.10.woff', { family: 'PetalumaScript' });

const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
global.window = dom.window;
global.document = dom.window.document;
// global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
// global.HTMLDivElement = dom.window.HTMLDivElement;

// const canvas1 = createCanvas(500, 500);
// const ctx1 = canvas1.getContext('2d');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

console.log(document.fonts);
return;

const fClef = 0xe062;
const gClef = 0xe050;

ctx.font = '128px PetalumaScript';
ctx.fillText(String.fromCharCode(gClef), 20, 220);
console.log(`<!DOCTYPE html><html><body><img src="${canvas.toDataURL()}"></body></html>`);

// const d = document.createElement('div');
// console.log(d instanceof window.HTMLDivElement);
// const c = document.createElement('canvas');
// console.log(c instanceof window.HTMLCanvasElement);
// const s = document.createElement('span');
// console.log(s instanceof window.HTMLSpanElement);

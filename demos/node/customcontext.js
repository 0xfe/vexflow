// node customcontext.js

const Vex = require('vexflow');

const VF = Vex.Flow;

// A custom Vex.Flow.RenderContext implementation.
// This is just a stub for demonstration purposes that console.logs method calls and arguments.
class CustomContext extends VF.RenderContext {
  constructor() {
    super();
    this.fillStyle = '';
    this.strokeStyle = '';
  }

  log(func, ...args) {
    for (let i = 0; i < args.length; ++i) {
      if (typeof args[i] == 'string') {
        args[i] = `"${args[i]}"`;
      }
    }
    console.log(`${func}(${args.join(', ')})`);
  }

  clear() {
    this.log('clear');
  }

  setFont(f, sz, wt, st) {
    this.log('setFont', f, sz, wt, st);
    return this;
  }

  getFont() {
    this.log(`getFont() => '10pt Arial'`);
    return '10pt Arial';
  }

  setFillStyle(style) {
    this.log('setFillStyle', style);
    return this;
  }

  setBackgroundFillStyle(style) {
    this.log('setBackgroundFillStyle', style);
    return this;
  }

  setStrokeStyle(style) {
    this.log('setStrokeStyle', style);
    return this;
  }

  setShadowColor(color) {
    this.log('setShadowColor', color);
    return this;
  }

  setShadowBlur(blur) {
    this.log('setShadowBlur', blur);
    return this;
  }

  setLineWidth(width) {
    this.log('setLineWidth', width);
    return this;
  }

  setLineCap(capType) {
    this.log('setLineCap', capType);
    return this;
  }

  setLineDash(dashPattern) {
    this.log('setLineDash', `[${dashPattern.join(', ')}]`);
    return this;
  }

  scale(x, y) {
    this.log('scale', x, y);
    return this;
  }

  rect(x, y, width, height) {
    this.log('rect', x, y, width, height);
    return this;
  }

  resize(width, height) {
    this.log('resize', width, height);
    return this;
  }

  fillRect(x, y, width, height) {
    this.log('fillRect', x, y, width, height);
    return this;
  }

  clearRect(x, y, width, height) {
    this.log('clearRect', x, y, width, height);
    return this;
  }

  beginPath() {
    this.log('beginPath');
    return this;
  }

  moveTo(x, y) {
    this.log('moveTo', x, y);
    return this;
  }

  lineTo(x, y) {
    this.log('lineTo', x, y);
    return this;
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.log('bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y);
    return this;
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    this.log('quadraticCurveTo', cpx, cpy, x, y);
    return this;
  }

  arc(x, y, radius, startAngle, endAngle, antiClockwise) {
    this.log('arc', x, y, radius, startAngle, endAngle, antiClockwise);
    return this;
  }

  fill(attributes) {
    this.log('fill');
    return this;
  }

  stroke() {
    this.log('stroke');
    return this;
  }

  closePath() {
    this.log('closePath');
    return this;
  }

  fillText(text, x, y) {
    this.log('fillText', text, x, y);
    return this;
  }

  save() {
    this.log('save');
    return this;
  }

  restore() {
    this.log('restore');
    return this;
  }

  openGroup(cls, id, attrs) {
    this.log('openGroup', cls, id);
  }

  closeGroup() {
    this.log('closeGroup');
  }

  add(child) {
    this.log('add');
  }

  measureText(text) {
    this.log('measureText', text);
    return { width: 0, height: 10 };
  }
}

const renderer = new VF.Renderer(new CustomContext());
const context = renderer.getContext();
context.setFont('Arial', 10).setBackgroundFillStyle('#eed');

const stave = new VF.Stave(10, 40, 400);
stave.addClef('treble');
stave.addTimeSignature('4/4');
stave.setContext(context).draw();

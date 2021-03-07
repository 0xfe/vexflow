// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A rendering context for the Raphael backend.
//
// ## Warning: Deprecated for SVGContext
// Except in instances where SVG support for IE < 9.0 is
// needed, SVGContext is recommended.

export class RaphaelContext {
  constructor(element) {
    this.element = element;
    this.paper = Raphael(element); // eslint-disable-line
    this.path = '';
    this.pen = { x: 0, y: 0 };
    this.lineWidth = 1.0;
    this.state = {
      scale: { x: 1, y: 1 },
      font_family: 'Arial',
      font_size: 8,
      font_weight: 800,
    };

    this.attributes = {
      'stroke-width': 0.3,
      fill: 'black',
      stroke: 'black',
      font: '10pt Arial',
    };

    this.background_attributes = {
      'stroke-width': 0,
      fill: 'white',
      stroke: 'white',
      font: '10pt Arial',
    };

    this.shadow_attributes = {
      width: 0,
      color: 'black',
    };

    this.state_stack = [];
  }

  // Containers not implemented
  openGroup() {}
  closeGroup() {}
  add() {}

  setFont(family, size, weight) {
    this.state.font_family = family;
    this.state.font_size = size;
    this.state.font_weight = weight;
    this.attributes.font =
      (this.state.font_weight || '') + ' ' + this.state.font_size * this.state.scale.x + 'pt ' + this.state.font_family;
    return this;
  }

  setRawFont(font) {
    this.attributes.font = font;
    return this;
  }

  setFillStyle(style) {
    this.attributes.fill = style;
    return this;
  }

  setBackgroundFillStyle(style) {
    this.background_attributes.fill = style;
    this.background_attributes.stroke = style;
    return this;
  }

  setStrokeStyle(style) {
    this.attributes.stroke = style;
    return this;
  }

  setShadowColor(style) {
    this.shadow_attributes.color = style;
    return this;
  }

  setShadowBlur(blur) {
    this.shadow_attributes.width = blur;
    return this;
  }

  setLineWidth(width) {
    this.attributes['stroke-width'] = width;
    this.lineWidth = width;
  }

  // Empty because there is no equivalent in SVG
  setLineDash() {
    return this;
  }
  setLineCap() {
    return this;
  }

  scale(x, y) {
    this.state.scale = { x, y };
    // The scale() method is deprecated as of Raphael.JS 2.0, and
    // can no longer be used as an option in an Element.attr() call.
    // It is preserved here for users running earlier versions of
    // Raphael.JS, though it has no effect on the SVG output in
    // Raphael 2 and higher.
    this.attributes.transform = 'S' + x + ',' + y + ',0,0';
    this.attributes.scale = x + ',' + y + ',0,0';
    this.attributes.font = this.state.font_size * this.state.scale.x + 'pt ' + this.state.font_family;
    this.background_attributes.transform = 'S' + x + ',' + y + ',0,0';
    this.background_attributes.font = this.state.font_size * this.state.scale.x + 'pt ' + this.state.font_family;
    return this;
  }

  clear() {
    this.paper.clear();
  }

  resize(width, height) {
    this.element.style.width = width;
    this.paper.setSize(width, height);
    return this;
  }

  // Sets the SVG `viewBox` property, which results in auto scaling images when its container
  // is resized.
  //
  // Usage: `ctx.setViewBox("0 0 600 400")`
  setViewBox(viewBox) {
    this.paper.canvas.setAttribute('viewBox', viewBox);
  }

  rect(x, y, width, height) {
    if (height < 0) {
      y += height;
      height = -height;
    }

    this.paper
      .rect(x, y, width - 0.5, height - 0.5)
      .attr(this.attributes)
      .attr('fill', 'none')
      .attr('stroke-width', this.lineWidth);
    return this;
  }

  fillRect(x, y, width, height) {
    if (height < 0) {
      y += height;
      height = -height;
    }

    this.paper.rect(x, y, width - 0.5, height - 0.5).attr(this.attributes);
    return this;
  }

  clearRect(x, y, width, height) {
    if (height < 0) {
      y += height;
      height = -height;
    }

    this.paper.rect(x, y, width - 0.5, height - 0.5).attr(this.background_attributes);
    return this;
  }

  beginPath() {
    this.path = '';
    this.pen.x = 0;
    this.pen.y = 0;
    return this;
  }

  moveTo(x, y) {
    this.path += 'M' + x + ',' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  lineTo(x, y) {
    this.path += 'L' + x + ',' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  bezierCurveTo(x1, y1, x2, y2, x, y) {
    this.path += 'C' + x1 + ',' + y1 + ',' + x2 + ',' + y2 + ',' + x + ',' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  quadraticCurveTo(x1, y1, x, y) {
    this.path += 'Q' + x1 + ',' + y1 + ',' + x + ',' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  // This is an attempt (hack) to simulate the HTML5 canvas
  // arc method.
  arc(x, y, radius, startAngle, endAngle, antiClockwise) {
    function normalizeAngle(angle) {
      while (angle < 0) {
        angle += Math.PI * 2;
      }

      while (angle > Math.PI * 2) {
        angle -= Math.PI * 2;
      }
      return angle;
    }

    startAngle = normalizeAngle(startAngle);
    endAngle = normalizeAngle(endAngle);

    if (startAngle > endAngle) {
      const tmp = startAngle;
      startAngle = endAngle;
      endAngle = tmp;
      antiClockwise = !antiClockwise;
    }

    const delta = endAngle - startAngle;

    if (delta > Math.PI) {
      this.arcHelper(x, y, radius, startAngle, startAngle + delta / 2, antiClockwise);
      this.arcHelper(x, y, radius, startAngle + delta / 2, endAngle, antiClockwise);
    } else {
      this.arcHelper(x, y, radius, startAngle, endAngle, antiClockwise);
    }
    return this;
  }

  arcHelper(x, y, radius, startAngle, endAngle, antiClockwise) {
    const x1 = x + radius * Math.cos(startAngle);
    const y1 = y + radius * Math.sin(startAngle);

    const x2 = x + radius * Math.cos(endAngle);
    const y2 = y + radius * Math.sin(endAngle);

    let largeArcFlag = 0;
    let sweepFlag = 0;
    if (antiClockwise) {
      sweepFlag = 1;
      if (endAngle - startAngle < Math.PI) {
        largeArcFlag = 1;
      }
    } else if (endAngle - startAngle > Math.PI) {
      largeArcFlag = 1;
    }

    this.path +=
      'M' +
      x1 +
      ',' +
      y1 +
      ',A' +
      radius +
      ',' +
      radius +
      ',0,' +
      largeArcFlag +
      ',' +
      sweepFlag +
      ',' +
      x2 +
      ',' +
      y2 +
      'M' +
      this.pen.x +
      ',' +
      this.pen.y;
  }

  // Adapted from the source for Raphael's Element.glow
  glow() {
    const out = this.paper.set();
    if (this.shadow_attributes.width > 0) {
      const sa = this.shadow_attributes;
      const num_paths = sa.width / 2;
      for (let i = 1; i <= num_paths; i++) {
        out.push(
          this.paper.path(this.path).attr({
            stroke: sa.color,
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round',
            'stroke-width': +((sa.width / num_paths) * i).toFixed(3),
            opacity: +((sa.opacity || 0.3) / num_paths).toFixed(3),
            // See note in this.scale(): In Raphael the scale() method
            // is deprecated and removed as of Raphael 2.0 and replaced
            // by the transform() method.  It is preserved here for
            // users with earlier versions of Raphael, but has no effect
            // on the output SVG in Raphael 2.0+.
            transform: this.attributes.transform,
            scale: this.attributes.scale,
          })
        );
      }
    }
    return out;
  }

  fill() {
    const elem = this.paper.path(this.path).attr(this.attributes).attr('stroke-width', 0);
    this.glow(elem);
    return this;
  }

  stroke() {
    // The first line of code below is, unfortunately, a bit of a hack:
    // Raphael's transform() scaling does not scale the stroke-width, so
    // in order to scale a stroke, we have to manually scale the
    // stroke-width.
    //
    // This works well so long as the X & Y states for this.scale() are
    // relatively similar.  However, if they are very different, we
    // would expect horizontal and vertical lines to have different
    // stroke-widths.
    //
    // In the future, if we want to support very divergent values for
    // horizontal and vertical scaling, we may want to consider
    // implementing SVG scaling with properties of the SVG viewBox &
    // viewPort and removing it entirely from the Element.attr() calls.
    // This would more closely parallel the approach taken in
    // canvascontext.js as well.

    const strokeWidth = (this.lineWidth * (this.state.scale.x + this.state.scale.y)) / 2;
    const elem = this.paper
      .path(this.path)
      .attr(this.attributes)
      .attr('fill', 'none')
      .attr('stroke-width', strokeWidth);
    this.glow(elem);
    return this;
  }

  closePath() {
    this.path += 'Z';
    return this;
  }

  measureText(text) {
    const txt = this.paper.text(0, 0, text).attr(this.attributes).attr('fill', 'none').attr('stroke', 'none');
    const bounds = txt.getBBox();
    txt.remove();

    return {
      width: bounds.width,
      height: bounds.height,
    };
  }

  fillText(text, x, y) {
    this.paper
      .text(x + this.measureText(text).width / 2, y - this.state.font_size / (2.25 * this.state.scale.y), text)
      .attr(this.attributes);

    return this;
  }

  save() {
    // TODO(mmuthanna): State needs to be deep-copied.
    this.state_stack.push({
      state: {
        font_family: this.state.font_family,
      },
      attributes: {
        font: this.attributes.font,
        fill: this.attributes.fill,
        stroke: this.attributes.stroke,
        'stroke-width': this.attributes['stroke-width'],
      },
      shadow_attributes: {
        width: this.shadow_attributes.width,
        color: this.shadow_attributes.color,
      },
    });
    return this;
  }

  restore() {
    // TODO(0xfe): State needs to be deep-restored.
    const state = this.state_stack.pop();
    this.state.font_family = state.state.font_family;
    this.attributes.font = state.attributes.font;
    this.attributes.fill = state.attributes.fill;
    this.attributes.stroke = state.attributes.stroke;
    this.attributes['stroke-width'] = state.attributes['stroke-width'];
    this.shadow_attributes.width = state.shadow_attributes.width;
    this.shadow_attributes.color = state.shadow_attributes.color;
    return this;
  }
}

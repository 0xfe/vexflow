// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Larry Kuhns
//
// ## Description
// This file implements the `Stroke` class which renders chord strokes
// that can be arpeggiated, brushed, rasquedo, etc.

import { Vex } from './vex';
import { Modifier } from './modifier';
import { Glyph } from './glyph';

export class JazzTechnique extends Modifier {
  static get CATEGORY() { return 'jazztechnique'; }
  // regardless of actual width, this is what we reports.  These symbols
  // tend to overlap the next notes
  static get ReportedWidth() {
    return 5;
  }
  static get Type() {
    return {
      SCOOP: 1,
      DOIT: 2,
      FALL_SHORT: 3,
      LIFT: 4,
      FALL_LONG: 5,
      BEND: 6,
      MUTE_CLOSED: 7,
      MUTE_OPEN: 8,
      FLIP: 9,
      TURN: 10,
      SMEAR: 11
    };
  }

  static get ArticulationPosition() {
    return [JazzTechnique.Type.BEND, JazzTechnique.Type.MUTE_CLOSED, JazzTechnique.Type.MUTE_OPEN];
  }
  static get StaffPosition() {
    return [JazzTechnique.Type.FLIP, JazzTechnique.Type.TURN, JazzTechnique.Type.SMEAR];
  }

  static get LeftPosition() {
    return [JazzTechnique.Type.SCOOP];
  }

  static get RightPosition() {
    return [
      JazzTechnique.Type.DOIT, JazzTechnique.Type.FALL_SHORT, JazzTechnique.Type.FALL_LONG, JazzTechnique.Type.FLIP,
      JazzTechnique.Type.TURN, JazzTechnique.Type.SMEAR
    ];
  }

  static get TypeToCode() {
    return {
      1: 'brassScoop',
      2: 'brassDoitMedium',
      3: 'brassFallLipShort',
      4: 'brassLiftMedium',
      5: 'brassFallRoughMedium',
      6: 'brassBend',
      7: 'brassMuteClosed',
      8: 'brassMuteOpen',
      9: 'brassFlip',
      10: 'brassJazzTurn',
      11: 'brassSmear'
    };
  }

  static get glyphMetrics() {
    return Vex.Flow.DEFAULT_FONT_STACK[0].metrics.glyphs.jazztechnique;
  }


  // Arrange strokes inside `ModifierContext`
  static format(techniques, state) {
    let left_shift = state.left_shift;
    let right_shift = state.right_shift;

    if (!techniques || techniques.length === 0) return this;

    techniques.forEach((technique) => {
      const width = technique.metrics.reportedWidth;
      if (JazzTechnique.RightPosition.indexOf(technique.type) >= 0) {
        technique.xOffset += (right_shift + 2);
      }
      if (JazzTechnique.LeftPosition.indexOf(technique.type) >= 0) {
        technique.xOffset -= (left_shift + 2);
      }
      if (technique.xOffset < 0) {
        left_shift += width;
      } else if (technique.xOffset > 0) {
        right_shift += width;
      }
    });

    state.left_shift = left_shift;
    state.right_shift = right_shift;
    return true;
  }

  get metrics() {
    return JazzTechnique.glyphMetrics[this.glyphCode];
  }

  constructor(type, options) {
    super();
    this.setAttribute('type', 'JazzTechnique');

    this.note = null;
    this.options = Vex.Merge({}, options);

    // multi voice - end note of stroke, set in draw()
    this.type = type;
    this.glyphCode = JazzTechnique.TypeToCode[this.type];
    const metrics = this.metrics;
    this.position = Modifier.Position.LEFT;
    this.xOffset = metrics.xOffset;
    this.yOffset = metrics.yOffset;
    this.scale = metrics.scale;

    // Allow user to pass in adjustments
    if (this.options.xAdjust) {
      this.xOffset += this.options.xAdjust;
    }
    if (this.options.yAdjust) {
      this.yOffset += this.options.yAdjust;
    }
    if (this.options.scaleAdjust) {
      this.scale *= this.options.scaleAdjust;
    }

    this.width = JazzTechnique.reportedWidth;

    this.render_options = {
      font_scale: 38,
      stroke_px: 3,
      stroke_spacing: 10,
    };

    this.font = {
      family: 'serif',
      size: 10,
      weight: 'bold italic',
    };

    this.setXShift(0);
    this.setWidth(10);
  }

  getCategory() { return JazzTechnique.CATEGORY; }
  getPosition() { return this.position; }
  addEndNote(note) { this.note_end = note; return this; }

  draw() {
    this.checkContext();
    this.setRendered();

    // Allow the application to move/locate the glyph
    this.context.save();
    const classString = Object.keys(this.getAttribute('classes')).join(' ');
    this.context.openGroup(classString, this.getAttribute('id'));

    if (!(this.note && (this.index != null))) {
      throw new Vex.RERR('NoAttachedNote', "Can't draw stroke without a note and index.");
    }

    const start = this.note.getModifierStartXY(this.position, this.index);
    let y = start.y;
    const x = start.x;

    if (this.note.hasStem()) {
      if (this.note.getStemDirection() === 1) {
        if (JazzTechnique.ArticulationPosition.indexOf(this.type) >= 0) {
          const bbox = this.note.getBoundingBox();
          y = bbox.y + bbox.h + 20;
        }
      }
    }
    if (this.note.getLineNumber() < 5 && JazzTechnique.StaffPosition.indexOf(this.type) >= 0) {
      y = this.note.getStave().getBoundingBox().y + 40;
    }

    Glyph.renderGlyph(
      this.context,
      x + this.xOffset,
      y + this.yOffset,
      this.render_options.font_scale * this.scale,
      this.glyphCode
    );

    this.context.closeGroup();
  }
}

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { StaveNote } from './stavenote';
import { Stem } from './stem';
import { Flow } from './tables';

export class GraceNote extends StaveNote {
  static get CATEGORY() {
    return 'gracenotes';
  }
  static get LEDGER_LINE_OFFSET() {
    return 2;
  }
  static get SCALE() {
    return 0.66;
  }

  constructor(note_struct) {
    super({
      glyph_font_scale: Flow.DEFAULT_NOTATION_FONT_SCALE * GraceNote.SCALE,
      stroke_px: GraceNote.LEDGER_LINE_OFFSET,
      ...note_struct,
    });
    this.setAttribute('type', 'GraceNote');

    this.slash = note_struct.slash;
    this.slur = true;

    this.buildNoteHeads();

    this.width = 3;
  }

  getStemExtension() {
    if (this.stem_extension_override != null) {
      return this.stem_extension_override;
    }

    const glyph = this.getGlyph();
    if (glyph) {
      let ret = super.getStemExtension();
      if (glyph.stem) {
        const staveNoteScale = this.getStaveNoteScale();
        ret = (Stem.HEIGHT + ret) * staveNoteScale - Stem.HEIGHT;
      }
      return ret;
    }

    return 0;
  }

  getCategory() {
    return GraceNote.CATEGORY;
  }

  // FIXME: move this to more basic class.
  getStaveNoteScale() {
    return this.render_options.glyph_font_scale / Flow.DEFAULT_NOTATION_FONT_SCALE;
  }

  draw() {
    super.draw();
    this.setRendered();
    const stem = this.stem;
    if (this.slash && stem) {
      const staveNoteScale = this.getStaveNoteScale();

      // some magic numbers are based on the staveNoteScale 0.66.
      const offsetScale = staveNoteScale / 0.66;
      let slashBBox = undefined;
      const beam = this.beam;
      if (beam) {
        // FIXME: should render slash after beam?
        if (!beam.postFormatted) {
          beam.postFormat();
        }

        slashBBox = this.calcBeamedNotesSlashBBox(8 * offsetScale, 8 * offsetScale, {
          stem: 6 * offsetScale,
          beam: 5 * offsetScale,
        });
      } else {
        const stem_direction = this.getStemDirection();
        const noteHeadBounds = this.getNoteHeadBounds();
        const noteStemHeight = stem.getHeight();
        let x = this.getAbsoluteX();
        let y =
          stem_direction === Flow.Stem.DOWN
            ? noteHeadBounds.y_top - noteStemHeight
            : noteHeadBounds.y_bottom - noteStemHeight;

        const defaultStemExtention =
          stem_direction === Flow.Stem.DOWN ? this.glyph.stem_down_extension : this.glyph.stem_up_extension;

        let defaultOffsetY = Flow.STEM_HEIGHT;
        defaultOffsetY -= defaultOffsetY / 2.8;
        defaultOffsetY += defaultStemExtention;
        y += defaultOffsetY * staveNoteScale * stem_direction;

        const offsets =
          stem_direction === Flow.Stem.UP
            ? {
                x1: 1,
                y1: 0,
                x2: 13,
                y2: -9,
              }
            : {
                x1: -4,
                y1: 1,
                x2: 13,
                y2: 9,
              };

        x += offsets.x1 * offsetScale;
        y += offsets.y1 * offsetScale;
        slashBBox = {
          x1: x,
          y1: y,
          x2: x + offsets.x2 * offsetScale,
          y2: y + offsets.y2 * offsetScale,
        };
      }

      // FIXME: avoide staff lines, leadger lines or others.

      const ctx = this.context;
      ctx.save();
      ctx.setLineWidth(1 * offsetScale); // FIXME: use more appropriate value.
      ctx.beginPath();
      ctx.moveTo(slashBBox.x1, slashBBox.y1);
      ctx.lineTo(slashBBox.x2, slashBBox.y2);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  calcBeamedNotesSlashBBox(slashStemOffset, slashBeamOffset, protrusions) {
    const beam = this.beam;
    const beam_slope = beam.slope;
    const isBeamEndNote = beam.notes[beam.notes.length - 1] === this;
    const scaleX = isBeamEndNote ? -1 : 1;
    const beam_angle = Math.atan(beam_slope * scaleX);

    // slash line intersecting point on beam.
    const iPointOnBeam = {
      dx: Math.cos(beam_angle) * slashBeamOffset,
      dy: Math.sin(beam_angle) * slashBeamOffset,
    };

    slashStemOffset *= this.getStemDirection();
    const slash_angle = Math.atan((iPointOnBeam.dy - slashStemOffset) / iPointOnBeam.dx);
    const protrusion_stem_dx = Math.cos(slash_angle) * protrusions.stem * scaleX;
    const protrusion_stem_dy = Math.sin(slash_angle) * protrusions.stem;
    const protrusion_beam_dx = Math.cos(slash_angle) * protrusions.beam * scaleX;
    const protrusion_beam_dy = Math.sin(slash_angle) * protrusions.beam;

    const stemX = this.getStemX();
    const stem0X = beam.notes[0].getStemX();
    const stemY = this.beam.getBeamYToDraw() + (stemX - stem0X) * beam_slope;

    const ret = {
      x1: stemX - protrusion_stem_dx,
      y1: stemY + slashStemOffset - protrusion_stem_dy,
      x2: stemX + iPointOnBeam.dx * scaleX + protrusion_beam_dx,
      y2: stemY + iPointOnBeam.dy + protrusion_beam_dy,
    };
    return ret;
  }
}

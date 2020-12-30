// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Balazs Forian-Szabo
//
// ## Description
//
// A basic implementation of grace notes
// to be rendered on a tab stave.
//
// See `tests/gracetabnote_tests.js` for usage examples.
import {TabNote} from './tabnote';
import {INoteRenderOptions, IStaveNoteStruct} from "./types/note";
import {Merge} from "./flow";

export class GraceTabNote extends TabNote {
  static get CATEGORY(): string {
    return 'gracetabnotes';
  }

  constructor(note_struct: IStaveNoteStruct) {
    super(note_struct, false);
    this.setAttribute('type', 'GraceTabNote');

    Merge(this.render_options, {
      // vertical shift from stave line
      y_shift: 0.3,
      // grace glyph scale
      scale: 0.6,
      // grace tablature font
      font: '7.5pt Arial',
    } as INoteRenderOptions);

    this.updateWidth();
  }

  getCategory(): string {
    return GraceTabNote.CATEGORY;
  }

  draw(): void {
    super.draw();
    this.setRendered();
  }
}

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Cyril Silverman
//
// ## Description
//
// This file implements key signatures. A key signature sits on a stave
// and indicates the notes with implicit accidentals.

import {Vex} from './vex';
import {Flow} from './tables';
import {StaveModifier} from './stavemodifier';
import {Glyph} from './glyph';
import {IAccItem} from "./types/common";
import {Stave} from "./stave";
import {IAccidentalSpacing, IAccList} from "./types/keysignature";

export class KeySignature extends StaveModifier {
  private readonly glyphFontScale: number;

  private glyphs: Glyph[];
  private xPositions: number[];
  private paddingForced: boolean;
  private formatted: boolean;
  private cancelKeySpec: string;
  private accList: IAccItem[];
  private keySpec: string;
  private alterKeySpec: string;

  static get CATEGORY(): string {
    return 'keysignatures';
  }

  // Space between natural and following accidental depending
  // on vertical position
  static get accidentalSpacing(): Record<string, IAccidentalSpacing> {
    return {
      '#': {
        above: 6,
        below: 4,
      },
      'b': {
        above: 4,
        below: 7,
      },
      'n': {
        above: 4,
        below: 1,
      },
      '##': {
        above: 6,
        below: 4,
      },
      'bb': {
        above: 4,
        below: 7,
      },
      'db': {
        above: 4,
        below: 7,
      },
      'd': {
        above: 4,
        below: 7,
      },
      'bbs': {
        above: 4,
        below: 7,
      },
      '++': {
        above: 6,
        below: 4,
      },
      '+': {
        above: 6,
        below: 4,
      },
      '+-': {
        above: 6,
        below: 4,
      },
      '++-': {
        above: 6,
        below: 4,
      },
      'bs': {
        above: 4,
        below: 10,
      },
      'bss': {
        above: 4,
        below: 10,
      },
    };
  }

  // Create a new Key Signature based on a `key_spec`
  constructor(keySpec: string, cancelKeySpec: string, alterKeySpec?: string) {
    super();
    this.setAttribute('type', 'KeySignature');

    this.setKeySig(keySpec, cancelKeySpec, alterKeySpec);
    this.setPosition(StaveModifier.Position.BEGIN);
    this.glyphFontScale = 38; // TODO(0xFE): Should this match StaveNote?
    this.glyphs = [];
    this.xPositions = []; // relative to this.x
    this.paddingForced = false;
  }

  getCategory(): string {
    return KeySignature.CATEGORY;
  }

  // Add an accidental glyph to the `KeySignature` instance which represents
  // the provided `acc`. If `nextAcc` is also provided, the appropriate
  // spacing will be included in the glyph's position
  convertToGlyph(acc: any, nextAcc: any): void {
    const accGlyphData = Flow.accidentalCodes(acc.type);
    const glyph = new Glyph(accGlyphData.code, this.glyphFontScale);

    // Determine spacing between current accidental and the next accidental
    let extraWidth = 1;
    if (acc.type === 'n' && nextAcc) {
      const spacing = KeySignature.accidentalSpacing[nextAcc.type];
      if (spacing) {
        const isAbove = nextAcc.line >= acc.line;
        extraWidth = isAbove ? spacing.above : spacing.below;
      }
    }

    // Place the glyph on the stave
    this.placeGlyphOnLine(glyph, this.stave, acc.line);
    this.glyphs.push(glyph);

    const xPosition = this.xPositions[this.xPositions.length - 1];
    const glyphWidth = glyph.getMetrics().width + extraWidth;
    // Store the next accidental's x position
    this.xPositions.push(xPosition + glyphWidth);
    // Expand size of key signature
    this.width += glyphWidth;
  }

  // Cancel out a key signature provided in the `spec` parameter. This will
  // place appropriate natural accidentals before the key signature.
  cancelKey(spec: string): this {
    this.formatted = false;
    this.cancelKeySpec = spec;

    return this;
  }

  convertToCancelAccList(spec: string): IAccList {
    // Get the accidental list for the cancelled key signature
    const cancel_accList = Flow.keySignature(spec);

    // If the cancelled key has a different accidental type, ie: # vs b
    const different_types = this.accList.length > 0
      && cancel_accList.length > 0
      && cancel_accList[0].type !== this.accList[0].type;

    // Determine how many naturals needed to add
    const naturals = different_types
      ? cancel_accList.length
      : cancel_accList.length - this.accList.length;

    // Return if no naturals needed
    if (naturals < 1) return undefined;

    // Get the line position for each natural
    const cancelled: IAccItem[] = [];
    for (let i = 0; i < naturals; i++) {
      let index = i;
      if (!different_types) {
        index = cancel_accList.length - naturals + i;
      }

      const acc = cancel_accList[index];
      cancelled.push({type: 'n', line: acc.line});
    }

    // Combine naturals with main accidental list for the key signature
    this.accList = cancelled.concat(this.accList);

    return {
      accList: cancelled,
      type: cancel_accList[0].type
    };
  }

  // Deprecated
  addToStave(stave: Stave): this {
    this.paddingForced = true;
    stave.addModifier(this);

    return this;
  }

  // Apply the accidental staff line placement based on the `clef` and
  // the  accidental `type` for the key signature ('# or 'b').
  convertAccLines(clef: string, type: string, accList = this.accList): void {
    let offset = 0.0; // if clef === "treble"
    let customLines; // when clef doesn't follow treble key sig shape

    switch (clef) {
      // Treble & Subbass both have offsets of 0, so are not included.
      case 'soprano':
        if (type === '#') customLines = [2.5, 0.5, 2, 0, 1.5, -0.5, 1];
        else offset = -1;
        break;
      case 'mezzo-soprano':
        if (type === 'b') customLines = [0, 2, 0.5, 2.5, 1, 3, 1.5];
        else offset = 1.5;
        break;
      case 'alto':
        offset = 0.5;
        break;
      case 'tenor':
        if (type === '#') customLines = [3, 1, 2.5, 0.5, 2, 0, 1.5];
        else offset = -0.5;
        break;
      case 'baritone-f':
      case 'baritone-c':
        if (type === 'b') customLines = [0.5, 2.5, 1, 3, 1.5, 3.5, 2];
        else offset = 2;
        break;
      case 'bass':
      case 'french':
        offset = 1;
        break;
      default:
        break;
    }

    // If there's a special case, assign those lines/spaces:
    let i;
    if (typeof customLines !== 'undefined') {
      for (i = 0; i < accList.length; ++i) {
        accList[i].line = customLines[i];
      }
    } else if (offset !== 0) {
      for (i = 0; i < accList.length; ++i) {
        accList[i].line += offset;
      }
    }
  }

  getPadding(index: number): number {
    if (!this.formatted) this.format();

    return (
      this.glyphs.length === 0 || (!this.paddingForced && index < 2) ?
        0 : this.padding
    );
  }

  getWidth(): number {
    if (!this.formatted) this.format();

    return this.width;
  }

  setKeySig(keySpec: string, cancelKeySpec: string, alterKeySpec?: string): this {
    this.formatted = false;
    this.keySpec = keySpec;
    this.cancelKeySpec = cancelKeySpec;
    this.alterKeySpec = alterKeySpec;

    return this;
  }

  // Alter the accidentals of a key spec one by one.
  // Each alteration is a new accidental that replaces the
  // original accidental (or the canceled one).
  alterKey(alterKeySpec: string): this {
    this.formatted = false;
    this.alterKeySpec = alterKeySpec;

    return this;
  }

  convertToAlterAccList(alterKeySpec: string): void {
    const max = Math.min(alterKeySpec.length, this.accList.length);
    for (let i = 0; i < max; ++i) {
      if (alterKeySpec[i]) {
        this.accList[i].type = alterKeySpec[i];
      }
    }
  }

  format(): void {
    if (!this.stave) {
      throw new Vex.RERR('KeySignatureError', "Can't draw key signature without stave.");
    }

    this.width = 0;
    this.glyphs = [];
    this.xPositions = [0]; // initialize with initial x position
    this.accList = Flow.keySignature(this.keySpec);
    const accList = this.accList;
    const firstAccidentalType = accList.length > 0 ? accList[0].type : null;
    let cancelAccList;
    if (this.cancelKeySpec) {
      cancelAccList = this.convertToCancelAccList(this.cancelKeySpec);
    }
    if (this.alterKeySpec) {
      this.convertToAlterAccList(this.alterKeySpec);
    }

    if (this.accList.length > 0) {
      const clef = ((this.position === StaveModifier.Position.END) ?
        this.stave.endClef : this.stave.clef) || this.stave.clef;
      if (cancelAccList) {
        this.convertAccLines(clef, cancelAccList.type, cancelAccList.accList);
      }
      this.convertAccLines(clef, firstAccidentalType, accList);
      for (let i = 0; i < this.accList.length; ++i) {
        this.convertToGlyph(this.accList[i], this.accList[i + 1]);
      }
    }

    this.formatted = true;
  }

  draw(): void {
    if (!this.x) {
      throw new Vex.RERR('KeySignatureError', "Can't draw key signature without x.");
    }

    if (!this.stave) {
      throw new Vex.RERR('KeySignatureError', "Can't draw key signature without stave.");
    }

    if (!this.formatted) this.format();
    this.setRendered();

    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      const x = this.x + this.xPositions[i];
      glyph.setStave(this.stave);
      glyph.setContext(this.stave.context);
      glyph.renderToStave(x);
    }
  }
}

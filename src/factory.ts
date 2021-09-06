// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
// MIT License

import { RuntimeError, log } from './util';
import { Accidental } from './accidental';
import { Articulation } from './articulation';
import { Annotation } from './annotation';
import { ChordSymbol } from './chordsymbol';
import { Formatter, FormatterOptions } from './formatter';
import { FretHandFinger } from './frethandfinger';
import { StringNumber } from './stringnumber';
import { TextDynamics } from './textdynamics';
import { ModifierContext } from './modifiercontext';
import { MultiMeasureRest, MultimeasureRestRenderOptions } from './multimeasurerest';
import { Renderer } from './renderer';
import { Stave, StaveOptions } from './stave';
import { StaveTie } from './stavetie';
import { StaveLine } from './staveline';
import { StaveNote, StaveNoteStruct } from './stavenote';
import { GlyphNote, GlyphNoteOptions } from './glyphnote';
import { RepeatNote } from './repeatnote';
import { StaveConnector } from './staveconnector';
import { System, SystemOptions } from './system';
import { TickContext } from './tickcontext';
import { Tuplet, TupletOptions } from './tuplet';
import { Voice } from './voice';
import { Beam } from './beam';
import { Curve, CurveOptions } from './curve';
import { GraceNote, GraceNoteStruct } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { NoteSubGroup } from './notesubgroup';
import { EasyScore, EasyScoreOptions } from './easyscore';
import { TimeSigNote } from './timesignote';
import { KeySigNote } from './keysignote';
import { ClefNote } from './clefnote';
import { PedalMarking } from './pedalmarking';
import { TextBracket } from './textbracket';
import { VibratoBracket } from './vibratobracket';
import { GhostNote } from './ghostnote';
import { BarNote } from './barnote';
import { TabNote, TabNoteStruct } from './tabnote';
import { TabStave } from './tabstave';
import { TextNote, TextNoteStruct } from './textnote';
import { TextFont, TextFontRegistry } from './textfont';
import { FontInfo, RenderContext } from './types/common';
import { Note, NoteStruct } from './note';
import { Glyph } from './glyph';
import { BarlineType } from './stavebarline';
import { StemmableNote } from './stemmablenote';
import { Element } from './element';

export interface FactoryOptions {
  stave: {
    space: number;
  };
  renderer: {
    elementId: string | null;
    backend?: number;
    width: number;
    height: number;
    background?: string;
  };
  font: {
    family: string;
    size: number;
    weight: string;
  };
}

// eslint-disable-next-line
function L(...args: any[]) {
  if (Factory.DEBUG) log('Vex.Flow.Factory', args);
}

/**
 * Factory implements a high level API around VexFlow. It will eventually
 * become the canonical way to use VexFlow.
 *
 * *This API is currently DRAFT*
 */
export class Factory {
  /** To enable logging for this class. Set `Vex.Flow.Factory.DEBUG` to `true`. */
  static DEBUG: boolean;

  protected options: FactoryOptions;

  protected stave?: Stave;
  protected context!: RenderContext;
  protected staves!: Stave[];
  protected voices!: Voice[];
  protected renderQ!: Element[];
  protected systems!: System[];

  /**
   * Constructor.
   *
   * Example:
   *
   * Create an SVG renderer and attach it to the DIV element named "boo" to render using <page-width> 1200 and <page-height> 600
   *
   * `const vf: Factory = new Vex.Flow.Factory({renderer: { elementId: 'boo', width: 1200, height: 600 }});`
   */
  constructor(options: Partial<FactoryOptions> = {}) {
    L('New factory: ', options);
    const defaults: FactoryOptions = {
      stave: {
        space: 10,
      },
      renderer: {
        elementId: '',
        backend: Renderer.Backends.SVG,
        width: 500,
        height: 200,
        background: '#FFF',
      },
      font: {
        family: 'Arial',
        size: 10,
        weight: '',
      },
    };

    this.options = defaults;
    this.setOptions(options);
  }

  /**
   * Static simplified function to access constructor without providing FactoryOptions
   *
   * Example:
   *
   * Create an SVG renderer and attach it to the DIV element named "boo" to render using <page-width> 1200 and <page-height> 600
   *
   * `const vf: Factory = Vex.Flow.Factory.newFromElementId('boo', 1200, 600 );`
   */
  static newFromElementId(elementId: string | null, width = 500, height = 200): Factory {
    return new Factory({ renderer: { elementId, width, height, backend: Renderer.Backends.SVG } });
  }

  reset(): void {
    this.renderQ = [];
    this.systems = [];
    this.staves = [];
    this.voices = [];
    this.stave = undefined; // current stave
  }

  getOptions(): FactoryOptions {
    return this.options;
  }

  setOptions(options: Partial<FactoryOptions> = {}): void {
    if (options.stave) this.options.stave = options.stave;
    if (options.renderer) this.options.renderer = options.renderer;
    if (options.font) this.options.font = options.font;
    if (this.options.renderer.elementId !== null) {
      this.initRenderer();
    }
    this.reset();
  }

  initRenderer(): void {
    if (!this.options.renderer) throw new RuntimeError('NoRenderer');
    const { elementId, backend, width, height, background } = this.options.renderer;
    if (elementId === '') {
      L(this);
      throw new RuntimeError('HTML DOM element not set in Factory');
    }

    this.context = Renderer.buildContext(
      elementId as string,
      backend ?? Renderer.Backends.SVG,
      width,
      height,
      background
    );
  }

  getContext(): RenderContext {
    return this.context;
  }

  setContext(context: RenderContext): this {
    this.context = context;
    return this;
  }

  getStave(): Stave | undefined {
    return this.stave;
  }

  getVoices(): Voice[] {
    return this.voices;
  }

  /** Return pixels from current stave spacing. */
  space(spacing: number): number {
    if (!this.options.stave) throw new RuntimeError('NoStave');
    return this.options.stave.space * spacing;
  }

  Stave(paramsP: { x?: number; y?: number; width?: number; options?: Partial<StaveOptions> } = {}): Stave {
    if (!this.options.renderer) throw new RuntimeError('NoRenderer');
    if (!this.options.stave) throw new RuntimeError('NoStave');
    const params = {
      ...{
        x: 0,
        y: 0,
        width: this.options.renderer.width - this.space(1),
        options: {
          spacing_between_lines_px: this.options.stave.space,
        },
      },
      ...paramsP,
    };

    const stave: Stave = new Stave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  TabStave(paramsP: { x?: number; y?: number; width?: number; options?: Partial<StaveOptions> } = {}): TabStave {
    if (!this.options.renderer) throw new RuntimeError('NoRenderer');
    if (!this.options.stave) throw new RuntimeError('NoStave');
    const params = {
      ...{
        x: 0,
        y: 0,
        width: this.options.renderer.width - this.space(1),
        options: {
          spacing_between_lines_px: this.options.stave.space * 1.3,
        },
      },
      ...paramsP,
    };

    const stave = new TabStave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  StaveNote(noteStruct: StaveNoteStruct): StaveNote {
    const note = new StaveNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GlyphNote(glyph: Glyph, noteStruct: NoteStruct, options: GlyphNoteOptions): GlyphNote {
    const note = new GlyphNote(glyph, noteStruct, options);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  RepeatNote(type: string, noteStruct: NoteStruct, options: GlyphNoteOptions): RepeatNote {
    const note = new RepeatNote(type, noteStruct, options);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GhostNote(noteStruct: string | NoteStruct): GhostNote {
    const ghostNote = new GhostNote(noteStruct);
    if (this.stave) ghostNote.setStave(this.stave);
    ghostNote.setContext(this.context);
    this.renderQ.push(ghostNote);
    return ghostNote;
  }

  TextNote(textNoteStruct: TextNoteStruct): TextNote {
    const textNote = new TextNote(textNoteStruct);
    if (this.stave) textNote.setStave(this.stave);
    textNote.setContext(this.context);
    this.renderQ.push(textNote);
    return textNote;
  }

  BarNote(params: { type?: BarlineType } = {}): BarNote {
    const barNote = new BarNote(params.type);
    if (this.stave) barNote.setStave(this.stave);
    barNote.setContext(this.context);
    this.renderQ.push(barNote);
    return barNote;
  }

  ClefNote(paramsP: { type?: string; options?: { size?: string; annotation?: string } } = {}): ClefNote {
    const params = {
      ...{
        type: 'treble',
        options: {
          size: 'default',
          annotation: undefined,
        },
      },
      ...paramsP,
    };

    const clefNote = new ClefNote(params.type, params.options.size, params.options.annotation);
    if (this.stave) clefNote.setStave(this.stave);
    clefNote.setContext(this.context);
    this.renderQ.push(clefNote);
    return clefNote;
  }

  TimeSigNote(paramsP: { time?: string } = {}): TimeSigNote {
    const params = {
      ...{
        time: '4/4',
      },
      ...paramsP,
    };

    const timeSigNote = new TimeSigNote(params.time);
    if (this.stave) timeSigNote.setStave(this.stave);
    timeSigNote.setContext(this.context);
    this.renderQ.push(timeSigNote);
    return timeSigNote;
  }

  KeySigNote(params: { key: string; cancelKey: string; alterKey: string }): KeySigNote {
    const keySigNote = new KeySigNote(params.key, params.cancelKey, params.alterKey);
    if (this.stave) keySigNote.setStave(this.stave);
    keySigNote.setContext(this.context);
    this.renderQ.push(keySigNote);
    return keySigNote;
  }

  TabNote(noteStruct: TabNoteStruct): TabNote {
    const note = new TabNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GraceNote(noteStruct: GraceNoteStruct): GraceNote {
    const note = new GraceNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    return note;
  }

  GraceNoteGroup(params: { notes: StemmableNote[]; slur?: boolean }): GraceNoteGroup {
    const group = new GraceNoteGroup(params.notes, params.slur);
    group.setContext(this.context);
    return group;
  }

  Accidental(params: { type: string }): Accidental {
    const accid = new Accidental(params.type);
    accid.setContext(this.context);
    return accid;
  }

  Annotation(
    paramsP: {
      text?: string;
      vJustify?: string;
      hJustify?: string;
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: string;
    } = {}
  ): Annotation {
    const params = {
      ...{
        text: 'p',
        vJustify: 'below',
        hJustify: 'center',
        fontFamily: 'Times',
        fontSize: 14,
        fontWeight: 'bold italic',
        options: {},
      },
      ...paramsP,
    };

    const annotation = new Annotation(params.text);
    annotation.setJustification(params.hJustify);
    annotation.setVerticalJustification(params.vJustify);
    annotation.setFont(params.fontFamily, params.fontSize, params.fontWeight);
    annotation.setContext(this.context);
    return annotation;
  }

  ChordSymbol(
    paramsP: {
      vJustify?: string;
      hJustify?: string;
      kerning?: boolean;
      reportWidth?: boolean;
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: string;
    } = {}
  ): ChordSymbol {
    const params = {
      ...{
        vJustify: 'top',
        hJustify: 'center',
        kerning: true,
        reportWidth: true,
      },
      ...paramsP,
    };

    const chordSymbol = new ChordSymbol();
    chordSymbol.setHorizontal(params.hJustify);
    chordSymbol.setVertical(params.vJustify);
    chordSymbol.setEnableKerning(params.kerning);
    chordSymbol.setReportWidth(params.reportWidth);
    // There is a default font based on the engraving font.  Only set then
    // font if it is specific, else use the default
    if (typeof params.fontFamily === 'string' && typeof params.fontSize === 'number') {
      if (typeof params.fontWeight === 'string')
        chordSymbol.setFont(params.fontFamily, params.fontSize, params.fontWeight);
      else chordSymbol.setFont(params.fontFamily, params.fontSize, '');
    } else if (typeof params.fontSize === 'number') {
      chordSymbol.setFontSize(params.fontSize);
    }
    chordSymbol.setContext(this.context);
    return chordSymbol;
  }

  Articulation(paramsP: { type?: string; position?: string | number } = {}): Articulation {
    const params = {
      ...{
        type: 'a.',
        position: 'above',
      },
      ...paramsP,
    };

    const articulation = new Articulation(params.type);
    articulation.setPosition(params.position);
    articulation.setContext(this.context);
    return articulation;
  }

  TextDynamics(paramsP: { text?: string; duration?: string; dots?: number; line?: number } = {}): TextDynamics {
    const params = {
      ...{
        text: 'p',
        duration: 'q',
        dots: 0,
        line: 0,
      },
      ...paramsP,
    };

    const text = new TextDynamics({
      text: params.text,
      line: params.line,
      duration: params.duration,
      dots: params.dots,
    });

    if (this.stave) text.setStave(this.stave);
    text.setContext(this.context);
    this.renderQ.push(text);
    return text;
  }

  Fingering(paramsP: { number: string; position?: string }): FretHandFinger {
    const params = {
      ...{
        number: '0',
        position: 'left',
      },
      ...paramsP,
    };

    const fingering = new FretHandFinger(params.number);
    fingering.setPosition(params.position);
    fingering.setContext(this.context);
    return fingering;
  }

  StringNumber(params: { number: string; position: string }): StringNumber {
    const stringNumber = new StringNumber(params.number);
    stringNumber.setPosition(params.position);
    stringNumber.setContext(this.context);
    return stringNumber;
  }

  TickContext(): TickContext {
    return new TickContext().setContext(this.context);
  }

  ModifierContext(): ModifierContext {
    return new ModifierContext();
  }

  MultiMeasureRest(params: Partial<MultimeasureRestRenderOptions>): MultiMeasureRest {
    if (params.number_of_measures === undefined) throw new RuntimeError('NoNumberOfMeasures');
    const multimeasurerest = new MultiMeasureRest(params.number_of_measures, params);
    multimeasurerest.setContext(this.context);
    this.renderQ.push(multimeasurerest);
    return multimeasurerest;
  }

  Voice(paramsP: { time?: string; options?: { softmaxFactor: number } } = {}): Voice {
    const params = {
      ...{
        time: '4/4',
      },
      ...paramsP,
    };
    const voice = new Voice(params.time, params.options);
    this.voices.push(voice);
    return voice;
  }

  StaveConnector(params: { top_stave: Stave; bottom_stave: Stave; type: string }): StaveConnector {
    const connector = new StaveConnector(params.top_stave, params.bottom_stave);
    connector.setType(params.type).setContext(this.context);
    this.renderQ.push(connector);
    return connector;
  }

  Formatter(options: Partial<FormatterOptions> = {}): Formatter {
    return new Formatter(options);
  }

  Tuplet(paramsP: { notes?: Note[]; options?: TupletOptions } = {}): Tuplet {
    const params = {
      ...{
        notes: [],
        options: {},
      },
      ...paramsP,
    };

    const tuplet = new Tuplet(params.notes, params.options).setContext(this.context);
    this.renderQ.push(tuplet);
    return tuplet;
  }

  Beam(params: { notes: StemmableNote[]; options?: { autoStem?: boolean; secondaryBeamBreaks?: number[] } }): Beam {
    const beam = new Beam(params.notes, params.options?.autoStem).setContext(this.context);
    beam.breakSecondaryAt(params.options?.secondaryBeamBreaks ?? []);
    this.renderQ.push(beam);
    return beam;
  }

  Curve(params: { from: Note; to: Note; options: Partial<CurveOptions> }): Curve {
    const curve = new Curve(params.from, params.to, params.options).setContext(this.context);
    this.renderQ.push(curve);
    return curve;
  }

  StaveTie(params: {
    from: Note;
    to: Note;
    first_indices?: number[];
    last_indices?: number[];
    text?: string;
    options?: { direction?: number };
  }): StaveTie {
    const tie = new StaveTie(
      {
        first_note: params.from,
        last_note: params.to,
        first_indices: params.first_indices,
        last_indices: params.last_indices,
      },
      params.text
    );

    if (params.options?.direction) tie.setDirection(params.options.direction);
    tie.setContext(this.context);
    this.renderQ.push(tie);
    return tie;
  }

  StaveLine(params: {
    from: StaveNote;
    to: StaveNote;
    first_indices: number[];
    last_indices: number[];
    options?: { text?: string; font?: FontInfo };
  }): StaveLine {
    const line = new StaveLine({
      first_note: params.from,
      last_note: params.to,
      first_indices: params.first_indices,
      last_indices: params.last_indices,
    });

    if (params.options?.text) line.setText(params.options.text);
    if (params.options?.font) line.setFont(params.options.font);

    line.setContext(this.context);
    this.renderQ.push(line);
    return line;
  }

  VibratoBracket(params: {
    from: Note;
    to: Note;
    options: {
      harsh?: boolean;
      line?: number;
    };
  }): VibratoBracket {
    const vibratoBracket = new VibratoBracket({
      start: params.from,
      stop: params.to,
    });

    if (params.options.line) vibratoBracket.setLine(params.options.line);
    if (params.options.harsh) vibratoBracket.setHarsh(params.options.harsh);

    vibratoBracket.setContext(this.context);
    this.renderQ.push(vibratoBracket);

    return vibratoBracket;
  }

  TextBracket(params: {
    from: Note;
    to: Note;
    text: string;
    options: {
      superscript: string;
      position: string;
      line?: number;
      font?: Partial<FontInfo>;
    };
  }): TextBracket {
    const textBracket = new TextBracket({
      start: params.from,
      stop: params.to,
      text: params.text,
      superscript: params.options.superscript,
      position: params.options.position,
    });

    if (params.options.line) textBracket.setLine(params.options.line);
    if (params.options.font) textBracket.setFont(params.options.font);

    textBracket.setContext(this.context);
    this.renderQ.push(textBracket);
    return textBracket;
  }

  System(params: Partial<SystemOptions> = {}): System {
    params.factory = this;
    const system = new System(params).setContext(this.context);
    this.systems.push(system);
    return system;
  }

  /**
   * Creates EasyScore. Normally the first step after constructing a Factory.
   *
   * Example:
   *
   * `const vf: Factory = new Vex.Flow.Factory({renderer: { elementId: 'boo', width: 1200, height: 600 }});`
   *
   * `const score: EasyScore = vf.EasyScore();`
   * @param options.factory optional instance of Factory
   * @param options.builder instance of Builder
   * @param options.commitHooks function to call after a note element is created
   * @param options.throwOnError throw error in case of parsing error
   */
  EasyScore(options: Partial<EasyScoreOptions> = {}): EasyScore {
    options.factory = this;
    return new EasyScore(options);
  }

  PedalMarking(paramsP: { notes?: StaveNote[]; options?: { style: string } } = {}): PedalMarking {
    const params = {
      ...{
        notes: [],
        options: {
          style: 'mixed',
        },
      },
      ...paramsP,
    };

    const pedal = new PedalMarking(params.notes);
    pedal.setType(PedalMarking.typeString[params.options.style]);
    pedal.setContext(this.context);
    this.renderQ.push(pedal);
    return pedal;
  }

  NoteSubGroup(paramsP: { notes?: Note[] } = {}): NoteSubGroup {
    const params = {
      ...{
        notes: [],
      },
      ...paramsP,
    };

    const group = new NoteSubGroup(params.notes);
    group.setContext(this.context);
    return group;
  }

  TextFont(params: TextFontRegistry): TextFont {
    params.factory = this;
    const textFont = new TextFont(params);
    return textFont;
  }

  /** Render the score. */
  draw(): void {
    this.systems.forEach((i) => i.setContext(this.context).format());
    this.staves.forEach((i) => i.setContext(this.context).draw());
    this.voices.forEach((i) => i.setContext(this.context).draw());
    this.renderQ.forEach((i) => {
      if (!i.isRendered()) i.setContext(this.context).draw();
    });
    this.systems.forEach((i) => i.setContext(this.context).draw());
    this.reset();
  }
}

// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
// MIT License

import { Accidental } from './accidental';
import { Annotation, AnnotationHorizontalJustify, AnnotationVerticalJustify } from './annotation';
import { Articulation } from './articulation';
import { BarNote } from './barnote';
import { Beam, PartialBeamDirection } from './beam';
import { ChordSymbol } from './chordsymbol';
import { ClefNote } from './clefnote';
import { Curve, CurveOptions } from './curve';
import { EasyScore, EasyScoreOptions } from './easyscore';
import { Element } from './element';
import { FontInfo } from './font';
import { Formatter, FormatterOptions } from './formatter';
import { FretHandFinger } from './frethandfinger';
import { GhostNote } from './ghostnote';
import { Glyph } from './glyph';
import { GlyphNote, GlyphNoteOptions } from './glyphnote';
import { GraceNote, GraceNoteStruct } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { KeySigNote } from './keysignote';
import { ModifierContext } from './modifiercontext';
import { MultiMeasureRest, MultimeasureRestRenderOptions } from './multimeasurerest';
import { Note, NoteStruct } from './note';
import { NoteSubGroup } from './notesubgroup';
import { Ornament } from './ornament';
import { PedalMarking } from './pedalmarking';
import { RenderContext } from './rendercontext';
import { Renderer } from './renderer';
import { RepeatNote } from './repeatnote';
import { Stave, StaveOptions } from './stave';
import { BarlineType } from './stavebarline';
import { StaveConnector, StaveConnectorType } from './staveconnector';
import { StaveLine } from './staveline';
import { StaveNote, StaveNoteStruct } from './stavenote';
import { StaveTie } from './stavetie';
import { StemmableNote } from './stemmablenote';
import { StringNumber } from './stringnumber';
import { System, SystemOptions } from './system';
import { TabNote, TabNoteStruct } from './tabnote';
import { TabStave } from './tabstave';
import { TextBracket } from './textbracket';
import { TextDynamics } from './textdynamics';
import { TextNote, TextNoteStruct } from './textnote';
import { TickContext } from './tickcontext';
import { TimeSigNote } from './timesignote';
import { Tuplet, TupletOptions } from './tuplet';
import { defined, log, RuntimeError } from './util';
import { VibratoBracket } from './vibratobracket';
import { Voice, VoiceTime } from './voice';
import { isHTMLCanvas } from './web';

export interface FactoryOptions {
  stave?: {
    space: number;
  };
  renderer?: {
    elementId: string | null;
    backend?: number;
    width: number;
    height: number;
    background?: string;
  };
  font?: FontInfo;
}

// eslint-disable-next-line
function L(...args: any[]) {
  if (Factory.DEBUG) log('Vex.Flow.Factory', args);
}

/**
 * Factory implements a high level API around VexFlow.
 */
export class Factory {
  /** To enable logging for this class. Set `Vex.Flow.Factory.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  /** Default text font. */
  static TEXT_FONT: Required<FontInfo> = { ...Element.TEXT_FONT };

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
    return new Factory({ renderer: { elementId, width, height } });
  }

  protected options: Required<FactoryOptions>;

  protected stave?: Stave;
  protected context!: RenderContext;
  protected staves!: Stave[];
  protected voices!: Voice[];
  protected renderQ!: Element[];
  protected systems!: System[];

  /**
   * Example:
   *
   * Create an SVG renderer and attach it to the DIV element named "boo" to render using <page-width> 1200 and <page-height> 600
   *
   * `const vf: Factory = new Vex.Flow.Factory({renderer: { elementId: 'boo', width: 1200, height: 600 }});`
   */
  constructor(options: FactoryOptions = {}) {
    L('New factory: ', options);
    this.options = {
      stave: {
        space: 10,
      },
      renderer: {
        elementId: '',
        width: 500,
        height: 200,
        background: '#FFF',
      },
      font: Factory.TEXT_FONT,
    };

    this.setOptions(options);
  }

  reset(): void {
    this.renderQ = [];
    this.systems = [];
    this.staves = [];
    this.voices = [];
    this.stave = undefined; // current stave
  }

  setOptions(options?: FactoryOptions): void {
    this.options = { ...this.options, ...options };
    this.initRenderer();
    this.reset();
  }

  initRenderer(): void {
    const { elementId, width, height, background } = this.options.renderer;
    if (elementId == null) {
      return;
    }

    if (elementId == '') {
      L(this);
      throw new RuntimeError('renderer.elementId not set in FactoryOptions');
    }

    let backend = this.options.renderer.backend;
    if (backend === undefined) {
      const elem = document.getElementById(elementId);
      // We use a custom type check here, because node-canvas mimics canvas,
      // but is not an instance of window.HTMLCanvasElement.
      // In fact, `window` might be undefined here.
      // See: https://www.npmjs.com/package/canvas
      if (isHTMLCanvas(elem)) {
        backend = Renderer.Backends.CANVAS;
      } else {
        backend = Renderer.Backends.SVG;
      }
    }

    this.context = Renderer.buildContext(elementId, backend, width, height, background);
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

  Stave(params?: { x?: number; y?: number; width?: number; options?: StaveOptions }): Stave {
    const staveSpace = this.options.stave.space;
    const p = {
      x: 0,
      y: 0,
      width: this.options.renderer.width - staveSpace * 1.0,
      options: { spacing_between_lines_px: staveSpace * 1.0 },
      ...params,
    };

    const stave: Stave = new Stave(p.x, p.y, p.width, p.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  TabStave(params?: { x?: number; y?: number; width?: number; options?: StaveOptions }): TabStave {
    const staveSpace = this.options.stave.space;
    const p = {
      x: 0,
      y: 0,
      width: this.options.renderer.width - staveSpace * 1.0,
      options: { spacing_between_lines_px: staveSpace * 1.3 },
      ...params,
    };

    const stave = new TabStave(p.x, p.y, p.width, p.options);
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

  GlyphNote(glyph: Glyph, noteStruct: NoteStruct, options?: GlyphNoteOptions): GlyphNote {
    const note = new GlyphNote(glyph, noteStruct, options);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  RepeatNote(type: string, noteStruct?: NoteStruct, options?: GlyphNoteOptions): RepeatNote {
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

  TextNote(noteStruct: TextNoteStruct): TextNote {
    const textNote = new TextNote(noteStruct);
    if (this.stave) textNote.setStave(this.stave);
    textNote.setContext(this.context);
    this.renderQ.push(textNote);
    return textNote;
  }

  BarNote(params: { type?: BarlineType | string } = {}): BarNote {
    const barNote = new BarNote(params.type);
    if (this.stave) barNote.setStave(this.stave);
    barNote.setContext(this.context);
    this.renderQ.push(barNote);
    return barNote;
  }

  ClefNote(params?: { type?: string; options?: { size?: string; annotation?: string } }): ClefNote {
    const p = {
      type: 'treble',
      options: {
        size: 'default',
        annotation: undefined,
      },
      ...params,
    };

    const clefNote = new ClefNote(p.type, p.options.size, p.options.annotation);
    if (this.stave) clefNote.setStave(this.stave);
    clefNote.setContext(this.context);
    this.renderQ.push(clefNote);
    return clefNote;
  }

  TimeSigNote(params?: { time?: string }): TimeSigNote {
    const p = {
      time: '4/4',
      ...params,
    };

    const timeSigNote = new TimeSigNote(p.time);
    if (this.stave) timeSigNote.setStave(this.stave);
    timeSigNote.setContext(this.context);
    this.renderQ.push(timeSigNote);
    return timeSigNote;
  }

  KeySigNote(params: { key: string; cancelKey?: string; alterKey?: string[] }): KeySigNote {
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

  Annotation(params?: {
    text?: string;
    hJustify?: string | AnnotationHorizontalJustify;
    vJustify?: string | AnnotationVerticalJustify;
    font?: FontInfo;
  }): Annotation {
    const p = {
      text: 'p',
      hJustify: AnnotationHorizontalJustify.CENTER,
      vJustify: AnnotationVerticalJustify.BOTTOM,
      ...params,
    };

    const annotation = new Annotation(p.text);
    annotation.setJustification(p.hJustify);
    annotation.setVerticalJustification(p.vJustify);
    annotation.setFont(p.font);
    annotation.setContext(this.context);
    return annotation;
  }

  ChordSymbol(params?: {
    vJustify?: string;
    hJustify?: string;
    kerning?: boolean;
    reportWidth?: boolean;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
  }): ChordSymbol {
    const p = {
      vJustify: 'top',
      hJustify: 'center',
      kerning: true,
      reportWidth: true,
      ...params,
    };

    const chordSymbol = new ChordSymbol();
    chordSymbol.setHorizontal(p.hJustify);
    chordSymbol.setVertical(p.vJustify);
    chordSymbol.setEnableKerning(p.kerning);
    chordSymbol.setReportWidth(p.reportWidth);
    // There is a default font based on the engraving font.  Only set then
    // font if it is specific, else use the default
    if (typeof p.fontFamily === 'string' && typeof p.fontSize === 'number') {
      if (typeof p.fontWeight === 'string') chordSymbol.setFont(p.fontFamily, p.fontSize, p.fontWeight);
      else chordSymbol.setFont(p.fontFamily, p.fontSize, '');
    } else if (typeof p.fontSize === 'number') {
      chordSymbol.setFontSize(p.fontSize);
    }
    chordSymbol.setContext(this.context);
    return chordSymbol;
  }

  Articulation(params?: { betweenLines?: boolean; type?: string; position?: string | number }): Articulation {
    const articulation = new Articulation(params?.type ?? 'a.');

    if (params?.position != undefined) articulation.setPosition(params.position);
    if (params?.betweenLines != undefined) articulation.setBetweenLines(params.betweenLines);
    articulation.setContext(this.context);
    return articulation;
  }

  Ornament(
    type: string,
    params?: { position?: string | number; upperAccidental?: string; lowerAccidental?: string; delayed?: boolean }
  ) {
    const options = {
      type,
      position: 0,
      accidental: '',
      ...params,
    };
    const ornament = new Ornament(type);
    ornament.setPosition(options.position);
    if (options.upperAccidental) {
      ornament.setUpperAccidental(options.upperAccidental);
    }
    if (options.lowerAccidental) {
      ornament.setLowerAccidental(options.lowerAccidental);
    }
    if (typeof options.delayed !== 'undefined') {
      ornament.setDelayed(options.delayed);
    }
    ornament.setContext(this.context);
    return ornament;
  }

  TextDynamics(params?: { text?: string; duration?: string; dots?: number; line?: number }): TextDynamics {
    const p = {
      text: 'p',
      duration: 'q',
      dots: 0,
      line: 0,
      ...params,
    };

    const text = new TextDynamics({
      text: p.text,
      line: p.line,
      duration: p.duration,
      dots: p.dots,
    });

    if (this.stave) text.setStave(this.stave);
    text.setContext(this.context);
    this.renderQ.push(text);
    return text;
  }

  Fingering(params: { number?: string; position?: string }): FretHandFinger {
    const p = {
      number: '0',
      position: 'left',
      ...params,
    };

    const fingering = new FretHandFinger(p.number);
    fingering.setPosition(p.position);
    fingering.setContext(this.context);
    return fingering;
  }

  StringNumber(params: { number: string; position: string }, drawCircle = true): StringNumber {
    const stringNumber = new StringNumber(params.number);
    stringNumber.setPosition(params.position);
    stringNumber.setContext(this.context);
    stringNumber.setDrawCircle(drawCircle);
    return stringNumber;
  }

  TickContext(): TickContext {
    return new TickContext();
  }

  ModifierContext(): ModifierContext {
    return new ModifierContext();
  }

  MultiMeasureRest(params: MultimeasureRestRenderOptions): MultiMeasureRest {
    const numMeasures = defined(params.number_of_measures, 'NoNumberOfMeasures');
    const multiMeasureRest = new MultiMeasureRest(numMeasures, params);
    multiMeasureRest.setContext(this.context);
    this.renderQ.push(multiMeasureRest);
    return multiMeasureRest;
  }

  Voice(params?: { time?: VoiceTime | string }): Voice {
    const p = {
      time: '4/4',
      ...params,
    };
    const voice = new Voice(p.time);
    this.voices.push(voice);
    return voice;
  }

  StaveConnector(params: { top_stave: Stave; bottom_stave: Stave; type: StaveConnectorType }): StaveConnector {
    const connector = new StaveConnector(params.top_stave, params.bottom_stave);
    connector.setType(params.type).setContext(this.context);
    this.renderQ.push(connector);
    return connector;
  }

  Formatter(options?: FormatterOptions): Formatter {
    return new Formatter(options);
  }

  Tuplet(params?: { notes?: Note[]; options?: TupletOptions }): Tuplet {
    const p = {
      notes: [],
      options: {},
      ...params,
    };

    const tuplet = new Tuplet(p.notes, p.options).setContext(this.context);
    this.renderQ.push(tuplet);
    return tuplet;
  }

  Beam(params: {
    notes: StemmableNote[];
    options?: {
      autoStem?: boolean;
      secondaryBeamBreaks?: number[];
      partialBeamDirections?: {
        [noteIndex: number]: PartialBeamDirection;
      };
    };
  }): Beam {
    const beam = new Beam(params.notes, params.options?.autoStem).setContext(this.context);
    beam.breakSecondaryAt(params.options?.secondaryBeamBreaks ?? []);
    if (params.options?.partialBeamDirections) {
      Object.entries(params.options?.partialBeamDirections).forEach(([noteIndex, direction]) => {
        beam.setPartialBeamSideAt(Number(noteIndex), direction);
      });
    }
    this.renderQ.push(beam);
    return beam;
  }

  Curve(params: { from: Note; to: Note; options: CurveOptions }): Curve {
    const curve = new Curve(params.from, params.to, params.options).setContext(this.context);
    this.renderQ.push(curve);
    return curve;
  }

  StaveTie(params: {
    from?: Note | null;
    to?: Note | null;
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
    from: Note | null;
    to: Note | null;
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
      font?: FontInfo;
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

  System(params: SystemOptions = {}): System {
    params.factory = this;
    const system = new System(params).setContext(this.context);
    this.systems.push(system);
    return system;
  }

  /**
   * Creates EasyScore. Normally the first step after constructing a Factory. For example:
   * ```
   * const vf: Factory = new Vex.Flow.Factory({renderer: { elementId: 'boo', width: 1200, height: 600 }});
   * const score: EasyScore = vf.EasyScore();
   * ```
   * @param options.factory optional instance of Factory
   * @param options.builder instance of Builder
   * @param options.commitHooks function to call after a note element is created
   * @param options.throwOnError throw error in case of parsing error
   */
  EasyScore(options: EasyScoreOptions = {}): EasyScore {
    options.factory = this;
    return new EasyScore(options);
  }

  PedalMarking(params?: { notes?: StaveNote[]; options?: { style: string } }): PedalMarking {
    const p = {
      notes: [],
      options: {
        style: 'mixed',
      },
      ...params,
    };

    const pedal = new PedalMarking(p.notes);
    pedal.setType(PedalMarking.typeString[p.options.style]);
    pedal.setContext(this.context);
    this.renderQ.push(pedal);
    return pedal;
  }

  NoteSubGroup(params?: { notes?: Note[] }): NoteSubGroup {
    const p = {
      notes: [],
      ...params,
    };

    const group = new NoteSubGroup(p.notes);
    group.setContext(this.context);
    return group;
  }

  /** Render the score. */
  draw(): void {
    const ctx = this.context;
    this.systems.forEach((s) => s.setContext(ctx).format());
    this.staves.forEach((s) => s.setContext(ctx).draw());
    this.voices.forEach((v) => v.setContext(ctx).draw());
    this.renderQ.forEach((e) => {
      if (!e.isRendered()) e.setContext(ctx).draw();
    });
    this.systems.forEach((s) => s.setContext(ctx).draw());
    this.reset();
  }
}

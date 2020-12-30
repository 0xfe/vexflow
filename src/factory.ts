// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a high level API around VexFlow. It will eventually
// become the canonical way to use VexFlow.
//
// *This API is currently DRAFT*
import {Accidental} from './accidental';
import {Articulation} from './articulation';
import {Annotation} from './annotation';
import {ChordSymbol} from './chordsymbol';
import {Formatter} from './formatter';
import {FretHandFinger} from './frethandfinger';
import {StringNumber} from './stringnumber';
import {TextDynamics} from './textdynamics';
import {ModifierContext} from './modifiercontext';
import {MultiMeasureRest} from './multimeasurerest';
import {Renderer} from './renderer';
import {Stave} from './stave';
import {StaveTie} from './stavetie';
import {StaveLine} from './staveline';
import {StaveNote} from './stavenote';
import {GlyphNote} from './glyphnote';
import {RepeatNote} from './repeatnote';
import {StaveConnector} from './staveconnector';
import {System} from './system';
import {TickContext} from './tickcontext';
import {Tuplet} from './tuplet';
import {Voice} from './voice';
import {Beam} from './beam';
import {Curve} from './curve';
import {GraceNote} from './gracenote';
import {GraceNoteGroup} from './gracenotegroup';
import {NoteSubGroup} from './notesubgroup';
import {EasyScore} from './easyscore';
import {TimeSigNote} from './timesignote';
import {KeySigNote} from './keysignote';
import {ClefNote} from './clefnote';
import {PedalMarking} from './pedalmarking';
import {TextBracket} from './textbracket';
import {VibratoBracket} from './vibratobracket';
import {GhostNote} from './ghostnote';
import {BarNote} from './barnote';
import {TabNote} from './tabnote';
import {TabStave} from './tabstave';
import {TextNote} from './textnote';
import {DrawContext, IRenderable} from "./types/common";
import {Glyph} from "./glyph";
import {INoteStruct, IStaveNoteStruct} from "./types/note";
import {TextFont} from './textfont';
import {IGlyphNoteOptions} from "./types/glyphnote";
import {IFactoryParams, IFactoryRendererOptions} from "./types/factory";
import {IStaveOptions} from "./types/stave";
import {IMultimeasureRestRenderOptions} from "./types/multimeasurerest";
import {ISystemOptions} from "./types/system";
import {ITextFontRegistry} from "./types/textfont";
import {IEasyScoreOptions} from "./types/easyscore";
import {LOG} from "./flow";
import {MakeException} from "./runtimeerror";

// To enable logging for this class. Set `Vex.Flow.Factory.DEBUG` to `true`.
function L(...args: unknown[]) {
  if (Factory.DEBUG) LOG('Vex.Flow.Factory', args);
}

const X = MakeException('FactoryError');

function setDefaults(params = {} as IFactoryParams, defaults: IFactoryParams) {
  const default_options = defaults.options;
  params = Object.assign(defaults, params);
  params.options = Object.assign(default_options, params.options);
  return params;
}

export class Factory {
  static DEBUG: boolean;

  private readonly options: IStaveOptions;

  private stave: Stave;
  private context: DrawContext;
  private staves: Stave[];
  private voices: Voice[];
  private renderQ: IRenderable[];
  private systems: System[];

  constructor(options: IStaveOptions) {
    L('New factory: ', options);
    this.options = {
      stave: {
        space: 10,
      },
      renderer: {
        context: null,
        elementId: '',
        backend: Renderer.Backends.SVG,
        width: 500,
        height: 200,
        background: '#FFF',
      },
      font: {
        face: 'Arial',
        point: 10,
        style: '',
      },
    } as IStaveOptions;
    this.setOptions(options);
  }

  static newFromElementId(elementId: string, width = 500, height = 200): Factory {
    return new Factory({renderer: {elementId, width, height} as IFactoryRendererOptions} as IStaveOptions);
  }

  reset(): void {
    this.renderQ = [];
    this.systems = [];
    this.staves = [];
    this.voices = [];
    this.stave = null; // current stave
  }

  getOptions(): IStaveOptions {
    return this.options;
  }

  setOptions(options: IStaveOptions): void {
    for (const key of ['stave', 'renderer', 'font']) {
      Object.assign(this.options[key], options[key]);
    }
    if (this.options.renderer.elementId !== null || this.options.renderer.context) {
      this.initRenderer();
    }

    this.reset();
  }

  initRenderer(): void {
    const {elementId, backend, width, height, background} = this.options.renderer;
    if (elementId === '') {
      throw new X('HTML DOM element not set in Factory');
    }

    this.context = Renderer.buildContext(elementId, backend, width, height, background);
  }

  getContext(): DrawContext {
    return this.context;
  }

  setContext(context: DrawContext): this {
    this.context = context;
    return this;
  }

  getStave(): Stave {
    return this.stave;
  }

  getVoices(): Voice[] {
    return this.voices;
  }

  // Returns pixels from current stave spacing.
  space(spacing: number): number {
    return this.options.stave.space * spacing;
  }

  Stave(params: IFactoryParams): Stave {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - this.space(1),
      options: {
        spacing_between_lines_px: this.options.stave.space,
      },
    } as IFactoryParams);

    const stave = new Stave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  TabStave(params: IFactoryParams): TabStave {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - this.space(1),
      options: {
        spacing_between_lines_px: this.options.stave.space * 1.3,
      },
    } as IFactoryParams);

    const stave = new TabStave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  StaveNote(noteStruct: IStaveNoteStruct): StaveNote {
    const note = new StaveNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GlyphNote(glyph: Glyph, noteStruct: IStaveNoteStruct, options: IGlyphNoteOptions): GlyphNote {
    const note = new GlyphNote(glyph, noteStruct, options);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  RepeatNote(type: string, noteStruct: INoteStruct, options: IGlyphNoteOptions): RepeatNote {
    const note = new RepeatNote(type, noteStruct, options);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GhostNote(noteStruct: IStaveNoteStruct): GhostNote {
    const ghostNote = new GhostNote(noteStruct);
    if (this.stave) ghostNote.setStave(this.stave);
    ghostNote.setContext(this.context);
    this.renderQ.push(ghostNote);
    return ghostNote;
  }

  TextNote(textNoteStruct: IStaveNoteStruct): TextNote {
    const textNote = new TextNote(textNoteStruct);
    if (this.stave) textNote.setStave(this.stave);
    textNote.setContext(this.context);
    this.renderQ.push(textNote);
    return textNote;
  }

  BarNote(params: IFactoryParams): BarNote {
    params = setDefaults(params, {
      type: 'single',
      options: {},
    } as IFactoryParams);

    const barNote = new BarNote(params.type as number);
    if (this.stave) barNote.setStave(this.stave);
    barNote.setContext(this.context);
    this.renderQ.push(barNote);
    return barNote;
  }

  ClefNote(params: IFactoryParams): ClefNote {
    params = setDefaults(params, {
      type: 'treble',
      options: {
        size: 'default',
      },
    } as IFactoryParams);

    const clefNote = new ClefNote(params.type as string, params.options.size, params.options.annotation);
    if (this.stave) clefNote.setStave(this.stave);
    clefNote.setContext(this.context);
    this.renderQ.push(clefNote);
    return clefNote;
  }

  TimeSigNote(params: IFactoryParams): TimeSigNote {
    params = setDefaults(params, {
      time: '4/4',
      options: {},
    } as IFactoryParams);

    const timeSigNote = new TimeSigNote(params.time);
    if (this.stave) timeSigNote.setStave(this.stave);
    timeSigNote.setContext(this.context);
    this.renderQ.push(timeSigNote);
    return timeSigNote;
  }

  KeySigNote(params: IFactoryParams): KeySigNote {
    const keySigNote = new KeySigNote(params.key, params.cancelKey, params.alterKey);
    if (this.stave) keySigNote.setStave(this.stave);
    keySigNote.setContext(this.context);
    this.renderQ.push(keySigNote);
    return keySigNote;
  }

  TabNote(noteStruct: IStaveNoteStruct): TabNote {
    const note = new TabNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GraceNote(noteStruct: IStaveNoteStruct): GraceNote {
    const note = new GraceNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    return note;
  }

  GraceNoteGroup(params: IFactoryParams): GraceNoteGroup {
    const group = new GraceNoteGroup(params.notes as GraceNote[], params.slur);
    group.setContext(this.context);
    return group;
  }

  Accidental(params: IFactoryParams): Accidental {
    params = setDefaults(params, {
      type: null,
      options: {},
    } as IFactoryParams);

    const accid = new Accidental(params.type as string);
    accid.setContext(this.context);
    return accid;
  }

  Annotation(params: IFactoryParams): Annotation {
    params = setDefaults(params, {
      text: 'p',
      vJustify: 'below',
      hJustify: 'center',
      fontFamily: 'Times',
      fontSize: 14,
      fontWeight: 'bold italic',
      options: {},
    } as IFactoryParams);

    const annotation = new Annotation(params.text);
    annotation.setJustification(params.hJustify);
    annotation.setVerticalJustification(params.vJustify);
    annotation.setFont(params.fontFamily, params.fontSize, params.fontWeight);
    annotation.setContext(this.context);
    return annotation;
  }

  ChordSymbol(params: IFactoryParams): ChordSymbol {
    params = setDefaults(params, {
      text: 'p',
      vJustify: 'below',
      hJustify: 'center',
      fontFamily: 'Times',
      fontSize: 14,
      fontWeight: 'bold italic',
      options: {},
    } as IFactoryParams);

    const chordSymbol = new ChordSymbol();
    //TODO start: Are these methods used?
    chordSymbol.setHorizontalJustification(params.hJustify);
    chordSymbol.setVerticalJustification(params.vJustify);
    //TODO end
    chordSymbol.setFont(params.fontFamily, params.fontSize, params.fontWeight);
    chordSymbol.setContext(this.context);
    return chordSymbol;
  }

  Articulation(params: IFactoryParams): Articulation {
    params = setDefaults(params, {
      type: 'a.',
      position: 'above',
      options: {},
    } as IFactoryParams);

    const articulation = new Articulation(params.type as string);
    articulation.setPosition(params.position);
    articulation.setContext(this.context);
    return articulation;
  }

  TextDynamics(params: IFactoryParams): TextDynamics {
    params = setDefaults(params, {
      text: 'p',
      duration: 'q',
      dots: 0,
      line: 0,
      options: {},
    } as IFactoryParams);

    const text = new TextDynamics({
      text: params.text,
      line: params.line,
      duration: params.duration,
      dots: params.dots,
    } as IStaveNoteStruct);

    if (this.stave) text.setStave(this.stave);
    text.setContext(this.context);
    this.renderQ.push(text);
    return text;
  }

  Fingering(params: IFactoryParams): FretHandFinger {
    params = setDefaults(params, {
      number: '0',
      position: 'left',
      options: {},
    } as IFactoryParams);

    const fingering = new FretHandFinger(params.number);
    fingering.setPosition(params.position);
    fingering.setContext(this.context);
    return fingering;
  }

  StringNumber(params: IFactoryParams): StringNumber {
    params = setDefaults(params, {
      number: '0',
      position: 'left',
      options: {},
    } as IFactoryParams);

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

  MultiMeasureRest(params: IMultimeasureRestRenderOptions): MultiMeasureRest {
    const multimeasurerest = new MultiMeasureRest(params.number_of_measures, params);
    multimeasurerest.setContext(this.context);
    this.renderQ.push(multimeasurerest);
    return multimeasurerest;
  }

  Voice(params: IFactoryParams): Voice {
    params = setDefaults(params, {
      time: '4/4',
      options: {},
    } as IFactoryParams);
    const voice = new Voice(params.time, params.options);
    this.voices.push(voice);
    return voice;
  }

  StaveConnector(params: IFactoryParams): StaveConnector {
    params = setDefaults(params, {
      top_stave: null,
      bottom_stave: null,
      type: 'double',
      options: {},
    } as IFactoryParams);
    const connector = new StaveConnector(params.top_stave, params.bottom_stave);
    connector.setType(params.type as number).setContext(this.context);
    this.renderQ.push(connector);
    return connector;
  }

  Formatter(): Formatter {
    return new Formatter();
  }

  Tuplet(params: IFactoryParams): Tuplet {
    params = setDefaults(params, {
      notes: [],
      options: {},
    } as IFactoryParams);

    const tuplet = new Tuplet(params.notes, params.options).setContext(this.context);
    this.renderQ.push(tuplet);
    return tuplet;
  }

  Beam(params: IFactoryParams): Beam {
    params = setDefaults(params, {
      notes: [],
      options: {
        autoStem: false,
        secondaryBeamBreaks: [],
      },
    } as IFactoryParams);

    const beam = new Beam(params.notes, params.options.autoStem).setContext(this.context);
    beam.breakSecondaryAt(params.options.secondaryBeamBreaks);
    this.renderQ.push(beam);
    return beam;
  }

  Curve(params: IFactoryParams): Curve {
    params = setDefaults(params, {
      from: null,
      to: null,
      options: {},
    } as IFactoryParams);

    const curve = new Curve(params.from, params.to, params.options).setContext(this.context);
    this.renderQ.push(curve);
    return curve;
  }

  StaveTie(params: IFactoryParams): StaveTie {
    params = setDefaults(params, {
      from: null,
      to: null,
      first_indices: [0],
      last_indices: [0],
      text: null,
      options: {
        direction: undefined,
      },
    } as IFactoryParams);

    const tie = new StaveTie({
      first_note: params.from,
      last_note: params.to,
      first_indices: params.first_indices,
      last_indices: params.last_indices,
    }, params.text);

    if (params.options.direction) tie.setDirection(params.options.direction);
    tie.setContext(this.context);
    this.renderQ.push(tie);
    return tie;
  }

  StaveLine(params: IFactoryParams): StaveLine {
    params = setDefaults(params, {
      from: null,
      to: null,
      first_indices: [0],
      last_indices: [0],
      options: {},
    } as IFactoryParams);

    const line = new StaveLine({
      first_note: params.from,
      last_note: params.to,
      first_indices: params.first_indices,
      last_indices: params.last_indices,
    });

    if (params.options.text) line.setText(params.options.text);
    if (params.options.font) line.setFont(params.options.font);

    line.setContext(this.context);
    this.renderQ.push(line);
    return line;
  }

  VibratoBracket(params: IFactoryParams): VibratoBracket {
    params = setDefaults(params, {
      from: null,
      to: null,
      options: {
        harsh: false,
      },
    } as IFactoryParams);

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

  TextBracket(params: IFactoryParams): TextBracket {
    params = setDefaults(params, {
      from: null,
      to: null,
      text: '',
      options: {
        superscript: '',
        position: 1,
      },
    } as IFactoryParams);

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

  System(params = {} as ISystemOptions): System {
    params.factory = this;
    const system = new System(params).setContext(this.context);
    this.systems.push(system);
    return system;
  }

  EasyScore(params = {} as IEasyScoreOptions): EasyScore {
    params.factory = this;
    return new EasyScore(params);
  }

  PedalMarking(params = {} as IFactoryParams): PedalMarking {
    params = setDefaults(params, {
      notes: [],
      options: {
        style: 'mixed',
      },
    } as IFactoryParams);

    const pedal = new PedalMarking(params.notes as StaveNote[]);
    pedal.setStyle(PedalMarking.StylesString[params.options.style]);
    pedal.setContext(this.context);
    this.renderQ.push(pedal);
    return pedal;
  }

  NoteSubGroup(params = {} as IFactoryParams): NoteSubGroup {
    params = setDefaults(params, {
      notes: [],
      options: {},
    } as IFactoryParams);

    const group = new NoteSubGroup(params.notes);
    group.setContext(this.context);
    return group;
  }

  TextFont(params = {} as ITextFontRegistry): TextFont {
    params.factory = this;
    return new TextFont(params);
  }

  draw(): void {
    this.systems.forEach(i => i.setContext(this.context).format());
    this.staves.forEach(i => i.setContext(this.context).draw());
    this.voices.forEach(i => i.setContext(this.context).draw());
    this.renderQ.forEach(i => {
      if (!i.isRendered()) i.setContext(this.context).draw();
    });
    this.systems.forEach(i => i.setContext(this.context).draw());
    this.reset();
  }
}

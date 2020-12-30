// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

/* eslint max-classes-per-file: "off" */

import {StaveNote} from './stavenote';
import {Parser} from './parser';
import {Articulation} from './articulation';
import {FretHandFinger} from './frethandfinger';
import {DrawContext, ICommitHook, IState} from "./types/common";
import {Factory} from "./factory";
import {
  IEasyScoreDefaults,
  IEasyScoreOptions,
  IGrammarVal
} from "./types/easyscore";
import {IBuilderElements, IBuilderOptions, IBuilderPiece} from "./types/builder";
import {IStaveNoteStruct} from "./types/note";
import {IFactoryParams} from "./types/factory";
import {Note} from "./note";
import {IStaveOptions} from "./types/stave";
import {IParserResult} from "./types/parser";
import {Voice} from "./voice";
import {LOG} from "./flow";
import {MakeException} from "./runtimeerror";

// To enable logging for this class. Set `Vex.Flow.EasyScore.DEBUG` to `true`.
function L(...args: unknown[]) {
  if (EasyScore.DEBUG) LOG('Vex.Flow.EasyScore', args);
}

const X = MakeException('EasyScoreError');

export class Grammar {
  private builder: Builder;

  constructor(builder: Builder) {
    this.builder = builder;
  }

  begin(): () => IGrammarVal {
    return this.LINE;
  }

  LINE(): IGrammarVal {
    return {
      expect: [this.PIECE, this.PIECES, this.EOL],
    } as IGrammarVal;
  }

  PIECE(): IGrammarVal {
    return {
      expect: [this.CHORDORNOTE, this.PARAMS],
      run: () => this.builder.commitPiece(),
    } as IGrammarVal;
  }

  PIECES(): IGrammarVal {
    return {
      expect: [this.COMMA, this.PIECE],
      zeroOrMore: true,
    } as IGrammarVal;
  }

  PARAMS(): IGrammarVal {
    return {
      expect: [this.DURATION, this.TYPE, this.DOTS, this.OPTS],
    } as IGrammarVal;
  }

  CHORDORNOTE(): IGrammarVal {
    return {
      expect: [this.CHORD, this.SINGLENOTE],
      or: true,
    } as IGrammarVal;
  }

  CHORD(): IGrammarVal {
    return {
      expect: [this.LPAREN, this.NOTES, this.RPAREN],
      run: (state: IState) => this.builder.addChord(state.matches[1]),
    } as IGrammarVal;
  }

  NOTES(): IGrammarVal {
    return {
      expect: [this.NOTE],
      oneOrMore: true,
    } as IGrammarVal;
  }

  NOTE(): IGrammarVal {
    return {
      expect: [this.NOTENAME, this.ACCIDENTAL, this.OCTAVE],
    } as IGrammarVal;
  }

  SINGLENOTE(): IGrammarVal {
    return {
      expect: [this.NOTENAME, this.ACCIDENTAL, this.OCTAVE],
      run: (state: IState) =>
        this.builder.addSingleNote(state.matches[0], state.matches[1], state.matches[2]),
    } as IGrammarVal;
  }

  ACCIDENTAL(): IGrammarVal {
    return {
      expect: [this.ACCIDENTALS],
      maybe: true,
    } as IGrammarVal;
  }

  DOTS(): IGrammarVal {
    return {
      expect: [this.DOT],
      zeroOrMore: true,
      run: (state: IState) => this.builder.setNoteDots(state.matches),
    } as IGrammarVal;
  }

  TYPE(): IGrammarVal {
    return {
      expect: [this.SLASH, this.MAYBESLASH, this.TYPES],
      maybe: true,
      run: (state: IState) => this.builder.setNoteType(state.matches[2]),
    } as IGrammarVal;
  }

  DURATION(): IGrammarVal {
    return {
      expect: [this.SLASH, this.DURATIONS],
      maybe: true,
      run: (state: IState) => this.builder.setNoteDuration(state.matches[1]),
    } as IGrammarVal;
  }

  OPTS(): IGrammarVal {
    return {
      expect: [this.LBRACKET, this.KEYVAL, this.KEYVALS, this.RBRACKET],
      maybe: true,
    } as IGrammarVal;
  }

  KEYVALS(): IGrammarVal {
    return {
      expect: [this.COMMA, this.KEYVAL],
      zeroOrMore: true,
    } as IGrammarVal;
  }

  KEYVAL(): IGrammarVal {
    const unquote = (str: string) => str.slice(1, -1);

    return {
      expect: [this.KEY, this.EQUALS, this.VAL],
      run: (state: IState) => this.builder.addNoteOption(state.matches[0], unquote(state.matches[2])),
    } as IGrammarVal;
  }

  VAL(): IGrammarVal {
    return {
      expect: [this.SVAL, this.DVAL],
      or: true,
    } as IGrammarVal;
  }

  KEY() { return { token: '[a-zA-Z][a-zA-Z0-9]*' } as IGrammarVal; }
  DVAL() { return { token: '["][^"]*["]' } as IGrammarVal; }
  SVAL() { return { token: "['][^']*[']" } as IGrammarVal; }
  NOTENAME() { return { token: '[a-gA-G]' } as IGrammarVal; }
  OCTAVE() { return { token: '[0-9]+' }as IGrammarVal;  }
  ACCIDENTALS() { return { token: 'bbs|bb|bss|bs|b|db|d|##|#|n|\\+\\+-|\\+-|\\+\\+|\\+|k|o' }as IGrammarVal; }
  DURATIONS() { return { token: '[0-9whq]+' } as IGrammarVal; }
  TYPES() { return { token: '[rRsSxX]' } as IGrammarVal; }
  LPAREN() { return { token: '[(]' } as IGrammarVal; }
  RPAREN() { return { token: '[)]' } as IGrammarVal; }
  COMMA() { return { token: '[,]' } as IGrammarVal; }
  DOT() { return { token: '[.]' } as IGrammarVal; }
  SLASH() { return { token: '[/]' } as IGrammarVal; }
  MAYBESLASH() { return { token: '[/]?' } as IGrammarVal; }
  EQUALS() { return { token: '[=]' } as IGrammarVal; }
  LBRACKET() { return { token: '\\[' } as IGrammarVal; }
  RBRACKET() { return { token: '\\]' } as IGrammarVal; }
  EOL() { return { token: '$' } as IGrammarVal; }
}

export class Builder {
  private readonly factory: Factory;

  private options: IBuilderOptions;
  private elements: IBuilderElements;
  private rollingDuration: string;
  private piece: IBuilderPiece;
  private commitHooks: ICommitHook[];

  constructor(factory: Factory) {
    this.factory = factory;
    this.commitHooks = [];
    this.reset();
  }

  reset(options = {}): void {
    this.options = {
      stem: 'auto',
      clef: 'treble',
    };
    this.elements = {
      notes: [],
      accidentals: [],
    };
    this.rollingDuration = '8';
    this.resetPiece();
    Object.assign(this.options, options);
  }

  getFactory(): Factory {
    return this.factory;
  }

  getElements(): IBuilderElements {
    return this.elements;
  }

  addCommitHook(commitHook: ICommitHook): void {
    this.commitHooks.push(commitHook);
  }

  resetPiece(): void {
    L('resetPiece');
    this.piece = {
      chord: [],
      duration: this.rollingDuration,
      dots: 0,
      type: undefined,
      options: {},
    };
  }

  setNoteDots(dots: string[]): void {
    L('setNoteDots:', dots);
    if (dots) this.piece.dots = dots.length;
  }

  setNoteDuration(duration: string): void {
    L('setNoteDuration:', duration);
    this.rollingDuration = this.piece.duration = duration || this.rollingDuration;
  }

  setNoteType(type: string): void {
    L('setNoteType:', type);
    if (type) this.piece.type = type;
  }

  addNoteOption(key: string, value: string): void {
    L('addNoteOption: key:', key, 'value:', value);
    this.piece.options[key] = value;
  }

  addNote(key?: string, accid?: string, octave?: string): void {
    L('addNote:', key, accid, octave);
    this.piece.chord.push({key, accid, octave});
  }

  addSingleNote(key: string, accid?: string, octave?: string): void {
    L('addSingleNote:', key, accid, octave);
    this.addNote(key, accid, octave);
  }

  addChord(notes: any[]): void {
    L('startChord');
    if (typeof (notes[0]) !== 'object') {
      this.addSingleNote(notes[0]);
    } else {
      notes.forEach(n => {
        if (n) this.addNote(...n);
      });
    }
    L('endChord');
  }

  commitPiece(): void {
    L('commitPiece');
    const {factory} = this;

    if (!factory) return;

    const options = {...this.options, ...this.piece.options};
    const {stem, clef} = options;
    const autoStem = stem.toLowerCase() === 'auto';
    const stemDirection = !autoStem && stem.toLowerCase() === 'up'
      ? StaveNote.STEM_UP
      : StaveNote.STEM_DOWN;

    // Build StaveNotes.
    const {chord, duration, dots, type} = this.piece;
    const keys = chord.map(note => note.key + '/' + note.octave);
    const note = factory.StaveNote({
      keys,
      duration,
      dots,
      type,
      clef,
      auto_stem: autoStem,
    } as IStaveNoteStruct);
    if (!autoStem) note.setStemDirection(stemDirection);

    // Attach accidentals.
    const accids = chord.map(note => note.accid || null);
    accids.forEach((accid, i) => {
      if (accid) note.addAccidental(i, factory.Accidental({type: accid} as IFactoryParams));
    });

    // Attach dots.
    for (let i = 0; i < dots; i++) note.addDotToAll();

    this.commitHooks.forEach(fn => fn(options, note, this));

    this.elements.notes.push(note);
    this.elements.accidentals.concat(accids);
    this.resetPiece();
  }
}

function setId({id}: any, note: StaveNote) {
  if (id === undefined) return;

  note.setAttribute('id', id);
}

function setClass(options: any, note: StaveNote) {
  if (!options.class) return;

  const commaSeparatedRegex = /\s*,\s*/;

  options.class
    .split(commaSeparatedRegex)
    .forEach((className: string) => note.addClass(className));
}

export class EasyScore {
  static DEBUG: boolean;

  private readonly defaults: IEasyScoreDefaults;

  private factory: Factory;
  private builder: Builder;
  private grammar: Grammar;
  private parser: Parser;
  private options: IEasyScoreOptions;

  constructor(options = {} as IEasyScoreOptions) {
    this.setOptions(options);
    this.defaults = {
      clef: 'treble',
      time: '4/4',
      stem: 'auto',
    };
  }

  set(defaults: IEasyScoreDefaults): this {
    Object.assign(this.defaults, defaults);
    return this;
  }

  setOptions(options: IEasyScoreOptions): this {
    this.options = {
      factory: null,
      builder: null,
      commitHooks: [
        setId,
        setClass,
        Articulation.easyScoreHook,
        FretHandFinger.easyScoreHook,
      ],
      throwOnError: false, ...options
    };

    this.factory = this.options.factory;
    this.builder = this.options.builder || new Builder(this.factory);
    this.grammar = new Grammar(this.builder);
    this.parser = new Parser(this.grammar);
    this.options.commitHooks.forEach((commitHook) => this.addCommitHook(commitHook));
    return this;
  }

  setContext(context: DrawContext): this {
    if (this.factory) this.factory.setContext(context);
    return this;
  }

  parse(line: string, options = {}): IParserResult {
    this.builder.reset(options);
    const result = this.parser.parse(line);
    if (!result.success && this.options.throwOnError) {
      throw new X('Error parsing line: ' + line, result);
    }
    return result;
  }

  beam(notes: Note[], options = {}): Note[] {
    this.factory.Beam({notes, options} as IFactoryParams);
    return notes;
  }

  tuplet(notes: Note[], options = {} as IStaveOptions): Note[] {
    this.factory.Tuplet({notes, options} as IFactoryParams);
    return notes;
  }

  notes(line: string, options = {}): Note[] {
    options = {clef: this.defaults.clef, stem: this.defaults.stem, ...options};
    this.parse(line, options);
    return this.builder.getElements().notes;
  }

  voice(notes: StaveNote[], voiceOptions: any): Voice {
    voiceOptions = {time: this.defaults.time, ...voiceOptions};
    return this.factory.Voice(voiceOptions).addTickables(notes);
  }

  addCommitHook(commitHook: ICommitHook): void {
    return this.builder.addCommitHook(commitHook);
  }
}

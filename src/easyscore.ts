// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Accidental } from './accidental';
import { Articulation } from './articulation';
import { PartialBeamDirection } from './beam';
import { Dot } from './dot';
import { Factory } from './factory';
import { FretHandFinger } from './frethandfinger';
import { Music } from './music';
import { Note } from './note';
import { Grammar, Match, Parser, Result, Rule, RuleFunction } from './parser';
import { RenderContext } from './rendercontext';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { TupletOptions } from './tuplet';
import { defined, log, RuntimeError } from './util';
import { Voice } from './voice';

// To enable logging for this class. Set `Vex.Flow.EasyScore.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args: any[]): void {
  if (EasyScore.DEBUG) log('Vex.Flow.EasyScore', args);
}

// eslint-disable-next-line
export type CommitHook = (obj: any, note: StemmableNote, builder: Builder) => void;

export class EasyScoreGrammar implements Grammar {
  builder: Builder;

  constructor(builder: Builder) {
    this.builder = builder;
  }

  begin(): RuleFunction {
    return this.LINE;
  }

  LINE(): Rule {
    return {
      expect: [this.PIECE, this.PIECES, this.EOL],
    };
  }
  PIECE(): Rule {
    return {
      expect: [this.CHORDORNOTE, this.PARAMS],
      run: () => this.builder.commitPiece(),
    };
  }
  PIECES(): Rule {
    return {
      expect: [this.COMMA, this.PIECE],
      zeroOrMore: true,
    };
  }
  PARAMS(): Rule {
    return {
      expect: [this.DURATION, this.TYPE, this.DOTS, this.OPTS],
    };
  }
  CHORDORNOTE(): Rule {
    return {
      expect: [this.CHORD, this.SINGLENOTE],
      or: true,
    };
  }
  CHORD(): Rule {
    return {
      expect: [this.LPAREN, this.NOTES, this.RPAREN],
      // eslint-disable-next-line
      run: (state) => this.builder.addChord(state!.matches[1] as Match[]),
    };
  }
  NOTES(): Rule {
    return {
      expect: [this.NOTE],
      oneOrMore: true,
    };
  }
  NOTE(): Rule {
    return {
      expect: [this.NOTENAME, this.ACCIDENTAL, this.OCTAVE],
    };
  }
  SINGLENOTE(): Rule {
    return {
      expect: [this.NOTENAME, this.ACCIDENTAL, this.OCTAVE],
      run: (state) => {
        // eslint-disable-next-line
        const s = state!;
        this.builder.addSingleNote(s.matches[0] as string, s.matches[1] as string, s.matches[2] as string);
      },
    };
  }
  ACCIDENTAL(): Rule {
    return {
      expect: [this.MICROTONES, this.ACCIDENTALS],
      maybe: true,
      or: true,
    };
  }
  DOTS(): Rule {
    return {
      expect: [this.DOT],
      zeroOrMore: true,
      // eslint-disable-next-line
      run: (state) => this.builder.setNoteDots(state!.matches),
    };
  }
  TYPE(): Rule {
    return {
      expect: [this.SLASH, this.MAYBESLASH, this.TYPES],
      maybe: true,
      // eslint-disable-next-line
      run: (state) => this.builder.setNoteType(state!.matches[2] as string),
    };
  }
  DURATION(): Rule {
    return {
      expect: [this.SLASH, this.DURATIONS],
      maybe: true,
      // eslint-disable-next-line
      run: (state) => this.builder.setNoteDuration(state!.matches[1] as string),
    };
  }
  OPTS(): Rule {
    return {
      expect: [this.LBRACKET, this.KEYVAL, this.KEYVALS, this.RBRACKET],
      maybe: true,
    };
  }
  KEYVALS(): Rule {
    return {
      expect: [this.COMMA, this.KEYVAL],
      zeroOrMore: true,
    };
  }
  KEYVAL(): Rule {
    const unquote = (str: string) => str.slice(1, -1);

    return {
      expect: [this.KEY, this.EQUALS, this.VAL],
      // eslint-disable-next-line
      run: (state) => this.builder.addNoteOption(state!.matches[0] as string, unquote(state!.matches[2] as string)),
    };
  }
  VAL(): Rule {
    return {
      expect: [this.SVAL, this.DVAL],
      or: true,
    };
  }

  KEY(): Rule {
    return { token: '[a-zA-Z][a-zA-Z0-9]*' };
  }
  DVAL(): Rule {
    return { token: '["][^"]*["]' };
  }
  SVAL(): Rule {
    return { token: "['][^']*[']" };
  }
  NOTENAME(): Rule {
    return { token: '[a-gA-G]' };
  }
  OCTAVE(): Rule {
    return { token: '[0-9]+' };
  }
  ACCIDENTALS(): Rule {
    return { token: 'bb|b|##|#|n' };
  }
  MICROTONES(): Rule {
    return { token: 'bbs|bss|bs|db|d|\\+\\+-|\\+-|\\+\\+|\\+|k|o' };
  }
  DURATIONS(): Rule {
    return { token: '[0-9whq]+' };
  }
  TYPES(): Rule {
    return { token: '[rRsSmMhHgG]' };
  }
  LPAREN(): Rule {
    return { token: '[(]' };
  }
  RPAREN(): Rule {
    return { token: '[)]' };
  }
  COMMA(): Rule {
    return { token: '[,]' };
  }
  DOT(): Rule {
    return { token: '[.]' };
  }
  SLASH(): Rule {
    return { token: '[/]' };
  }
  MAYBESLASH(): Rule {
    return { token: '[/]?' };
  }
  EQUALS(): Rule {
    return { token: '[=]' };
  }
  LBRACKET(): Rule {
    return { token: '\\[' };
  }
  RBRACKET(): Rule {
    return { token: '\\]' };
  }
  EOL(): Rule {
    return { token: '$' };
  }
}

export interface NotePiece {
  key: string;
  accid?: string | null;
  octave?: string;
}

export class Piece {
  chord: NotePiece[] = [];
  duration: string;
  dots: number = 0;
  type?: string;
  options: { [x: string]: string } = {};
  constructor(duration: string) {
    this.duration = duration;
  }
}

export interface BuilderElements {
  notes: StemmableNote[];
  accidentals: (Accidental | undefined)[][];
}

// Extending Record<string, any> allows arbitrary properties via Builder.reset() & EasyScore.parse().
// eslint-disable-next-line
export interface BuilderOptions extends Record<string, any> {
  stem?: string;
  clef?: string;
}

export class Builder {
  factory: Factory;
  // Initialized by the constructor via this.reset().
  elements!: BuilderElements;
  // Initialized by the constructor via this.reset().
  options!: BuilderOptions;
  // Initialized by the constructor via this.resetPiece().
  piece!: Piece;
  commitHooks: CommitHook[] = [];
  rollingDuration!: string;

  constructor(factory: Factory) {
    this.factory = factory;
    this.reset();
  }

  reset(options?: BuilderOptions): void {
    this.options = {
      stem: 'auto',
      clef: 'treble',
      ...options,
    };
    this.elements = { notes: [], accidentals: [] };
    this.rollingDuration = '8';
    this.resetPiece();
  }

  getFactory(): Factory {
    return this.factory;
  }

  getElements(): BuilderElements {
    return this.elements;
  }

  addCommitHook(commitHook: CommitHook): void {
    this.commitHooks.push(commitHook);
  }

  resetPiece(): void {
    L('resetPiece');
    this.piece = new Piece(this.rollingDuration);
  }

  setNoteDots(dots: Match[]): void {
    L('setNoteDots:', dots);
    if (dots) this.piece.dots = dots.length;
  }

  setNoteDuration(duration?: string): void {
    L('setNoteDuration:', duration);
    this.rollingDuration = this.piece.duration = duration || this.rollingDuration;
  }

  setNoteType(type?: string): void {
    L('setNoteType:', type);
    if (type) this.piece.type = type;
  }

  addNoteOption(key: string, value: string): void {
    L('addNoteOption: key:', key, 'value:', value);
    this.piece.options[key] = value;
  }

  addNote(key?: string, accid?: string | null, octave?: string): void {
    L('addNote:', key, accid, octave);
    this.piece.chord.push({
      key: key as string,
      accid,
      octave,
    });
  }

  addSingleNote(key: string, accid?: string | null, octave?: string): void {
    L('addSingleNote:', key, accid, octave);
    this.addNote(key, accid, octave);
  }

  // notes is an array with 3 entries
  addChord(notes: Match[]): void {
    L('startChord');
    if (typeof notes[0] !== 'object') {
      this.addSingleNote(notes[0]);
    } else {
      notes.forEach((n) => {
        if (n) this.addNote(...(n as string[])); // n => [string, string | null, string]
      });
    }
    L('endChord');
  }

  commitPiece(): void {
    L('commitPiece');
    const { factory } = this;

    if (!factory) return;

    const options = { ...this.options, ...this.piece.options };

    // reset() sets this.options.stem & this.options.clef but we check to make sure nothing has changed.
    // e.g., auto | up | down
    const stem = defined(options.stem, 'BadArguments', 'options.stem is not defined').toLowerCase();
    // e.g., treble | bass
    const clef = defined(options.clef, 'BadArguments', 'options.clef is not defined').toLowerCase();

    const { chord, duration, dots, type } = this.piece;

    // Create a string[] that will be assigned to the .keys property of the StaveNote.
    // Each string in the array represents a note pitch and is of the form: {NoteName}{Accidental}/{Octave}
    // Only standard accidentals are included in the .keys property. Microtonal accidentals are not included.
    const standardAccidentals = Music.accidentals;
    const keys = chord.map(
      (notePiece) =>
        notePiece.key +
        (standardAccidentals.includes(notePiece.accid ?? '') ? notePiece.accid : '') +
        '/' +
        notePiece.octave
    );
    const auto_stem = stem === 'auto'; // StaveNoteStruct expects the underscore & lowercase.

    // Build a GhostNote or StaveNote using the information we gathered.
    const note =
      type?.toLowerCase() == 'g'
        ? factory.GhostNote({ duration, dots })
        : factory.StaveNote({ keys, duration, dots, type, clef, auto_stem });
    if (!auto_stem) note.setStemDirection(stem === 'up' ? Stem.UP : Stem.DOWN);

    // Attach accidentals.
    const accidentals: (Accidental | undefined)[] = [];
    chord.forEach((notePiece: NotePiece, index: number) => {
      const accid = notePiece.accid;
      if (typeof accid === 'string') {
        const accidental = factory.Accidental({ type: accid });
        note.addModifier(accidental, index);
        accidentals.push(accidental);
      } else {
        accidentals.push(undefined);
      }
    });

    // Attach dots.
    for (let i = 0; i < dots; i++) Dot.buildAndAttach([note], { all: true });

    this.commitHooks.forEach((commitHook) => commitHook(options, note, this));

    this.elements.notes.push(note);
    this.elements.accidentals.push(accidentals);
    this.resetPiece();
  }
}

export interface EasyScoreOptions {
  factory?: Factory;
  builder?: Builder;
  commitHooks?: CommitHook[];
  throwOnError?: boolean;
}

// Extending Record<string, any> allows arbitrary properties via set(defaults).
// eslint-disable-next-line
export interface EasyScoreDefaults extends Record<string, any> {
  clef?: string;
  time?: string;
  stem?: string;
}

/**
 * Commit hook used by EasyScore.setOptions().
 */
function setId(options: { id?: string }, note: StemmableNote) {
  if (options.id === undefined) return;
  note.setAttribute('id', options.id);
}

// Used by setClass() below.
const commaSeparatedRegex = /\s*,\s*/;

/**
 * Commit hook used by EasyScore.setOptions().
 */
function setClass(options: { class?: string }, note: StemmableNote) {
  if (options.class === undefined) return;
  options.class.split(commaSeparatedRegex).forEach((className: string) => note.addClass(className));
}

/**
 * EasyScore implements a parser for a simple language to generate VexFlow objects.
 */
export class EasyScore {
  static DEBUG: boolean = false;

  defaults: EasyScoreDefaults = {
    clef: 'treble',
    time: '4/4',
    stem: 'auto',
  };

  // options, factory, builder, grammar, and parser are all
  // initialized by the constructor via this.setOptions().
  options!: EasyScoreOptions;
  factory!: Factory;
  builder!: Builder;
  grammar!: EasyScoreGrammar;
  parser!: Parser;

  constructor(options: EasyScoreOptions = {}) {
    this.setOptions(options);
  }

  /**
   * Set the score defaults.
   * clef must be set appropriately to avoid errors when adding Staves.
   * @param defaults.clef default clef ( treble | bass ...) see {@link Clef.types}
   * @param defaults.time default time signature ( 4/4 | 9/8 ...)
   * @param defaults.stem default stem arrangement (auto | up | down)
   * @returns this
   */
  set(defaults: EasyScoreDefaults): this {
    this.defaults = { ...this.defaults, ...defaults };
    return this;
  }

  /**
   * @param options.factory is required.
   * @returns this
   */
  setOptions(options: EasyScoreOptions): this {
    // eslint-disable-next-line
    const factory = options.factory!; // ! operator, because options.factory was set in Factory.EasyScore().
    const builder = options.builder ?? new Builder(factory);

    this.options = {
      commitHooks: [setId, setClass, Articulation.easyScoreHook, FretHandFinger.easyScoreHook],
      throwOnError: false,
      ...options,
      factory,
      builder,
    };

    this.factory = factory;
    this.builder = builder;
    this.grammar = new EasyScoreGrammar(this.builder);
    this.parser = new Parser(this.grammar);
    this.options.commitHooks?.forEach((commitHook) => this.addCommitHook(commitHook));
    return this;
  }

  setContext(context: RenderContext): this {
    this.factory.setContext(context);
    return this;
  }

  parse(line: string, options: BuilderOptions = {}): Result {
    this.builder.reset(options);
    const result = this.parser.parse(line);
    if (!result.success && this.options.throwOnError) {
      L(result);
      throw new RuntimeError('Error parsing line: ' + line);
    }
    return result;
  }

  beam(
    notes: StemmableNote[],
    options?: {
      autoStem?: boolean;
      secondaryBeamBreaks?: number[];
      partialBeamDirections?: {
        [noteIndex: number]: PartialBeamDirection;
      };
    }
  ): StemmableNote[] {
    this.factory.Beam({ notes, options });
    return notes;
  }

  tuplet(notes: StemmableNote[], options?: TupletOptions): StemmableNote[] {
    this.factory.Tuplet({ notes, options });
    return notes;
  }

  notes(line: string, options: BuilderOptions = {}): StemmableNote[] {
    options = { clef: this.defaults.clef, stem: this.defaults.stem, ...options };
    this.parse(line, options);
    return this.builder.getElements().notes;
  }

  voice(notes: Note[], options: { time?: string; options?: { softmaxFactor: number } } = {}): Voice {
    options = { time: this.defaults.time, ...options };
    return this.factory.Voice(options).addTickables(notes);
  }

  addCommitHook(commitHook: CommitHook): void {
    this.builder.addCommitHook(commitHook);
  }
}

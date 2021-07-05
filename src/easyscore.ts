// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

/* eslint max-classes-per-file: "off" */

import { RuntimeError, MakeException, log } from './util';
import { StaveNote } from './stavenote';
import { Match, Parser, Result, Rule, RuleFunction } from './parser';
import { Articulation } from './articulation';
import { FretHandFinger } from './frethandfinger';
import { Factory } from './factory';
import { RenderContext } from './types/common';
import { Accidental } from './accidental';
import { Modifier } from './modifier';
import { Voice } from './voice';

// To enable logging for this class. Set `Vex.Flow.EasyScore.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args: any[]): void {
  if (EasyScore.DEBUG) log('Vex.Flow.EasyScore', args);
}

const X = MakeException('EasyScoreError');

type IDUpdate = { id: string };
type ClassUpdate = { class: string };
// eslint-disable-next-line
type CommitHook = (obj: any, note: StaveNote, builder: Builder) => void;

export class Grammar {
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
      expect: [this.ACCIDENTALS],
      maybe: true,
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
    return { token: 'bbs|bb|bss|bs|b|db|d|##|#|n|\\+\\+-|\\+-|\\+\\+|\\+|k|o' };
  }
  DURATIONS(): Rule {
    return { token: '[0-9whq]+' };
  }
  TYPES(): Rule {
    return { token: '[rRsSxX]' };
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

interface NotePiece {
  key: string;
  accid?: string | null;
  octave?: string;
}

class Piece {
  chord: NotePiece[] = [];
  duration: string;
  dots: number = 0;
  type?: string;
  options: { [x: string]: string } = {};
  constructor(duration: string) {
    this.duration = duration;
  }
}

interface BuilderElements {
  notes: StaveNote[];
  accidentals: (Accidental | undefined)[][];
}

interface BuilderOptions {
  stem?: string;
  clef?: string;
  // eslint-disable-next-line
  [x: string]: any; // allow arbitrary options via reset(...)
}

export class Builder {
  factory: Factory;
  elements!: BuilderElements;
  options!: BuilderOptions;
  commitHooks: CommitHook[] = [];
  piece!: Piece;
  rollingDuration!: string;

  constructor(factory: Factory) {
    this.factory = factory;
    this.reset();
  }

  reset(options: BuilderOptions = {}): void {
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
      accid: accid,
      octave: octave,
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
      notes.forEach((n: Match) => {
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
    if (options.stem === undefined) {
      throw new RuntimeError('options.stem is not defined');
    }
    if (options.clef === undefined) {
      throw new RuntimeError('options.clef is not defined');
    }
    const stem: string = options.stem.toLowerCase(); // e.g., auto | up | down
    const clef: string = options.clef; // e.g., treble | bass

    const autoStem = stem === 'auto';
    const stemDirection = !autoStem && stem === 'up' ? StaveNote.STEM_UP : StaveNote.STEM_DOWN;

    // Build StaveNotes.
    const { chord, duration, dots, type } = this.piece;
    const keys: string[] = chord.map((notePiece) => notePiece.key + '/' + notePiece.octave);
    const note = factory.StaveNote({
      keys,
      duration,
      dots,
      type,
      clef,
      auto_stem: autoStem,
    });
    if (!autoStem) note.setStemDirection(stemDirection);

    // Attach accidentals.
    const accidentals: (Accidental | undefined)[] = [];
    chord.forEach((notePiece: NotePiece, index: number) => {
      const accid = notePiece.accid;
      if (typeof accid === 'string') {
        const accidental: Accidental = factory.Accidental({ type: accid });
        // TODO: Remove "as unknown as Modifier".
        // This compilation warning will be fixed after factory & accidental are migrated to typescript.
        note.addAccidental(index, accidental as unknown as Modifier);
        accidentals.push(accidental);
      } else {
        accidentals.push(undefined);
      }
    });

    // Attach dots.
    for (let i = 0; i < dots; i++) note.addDotToAll();

    this.commitHooks.forEach((fn) => fn(options, note, this));

    this.elements.notes.push(note);
    this.elements.accidentals.push(accidentals);
    this.resetPiece();
  }
}

function setId(options: IDUpdate, note: StaveNote) {
  if (options.id === undefined) return;
  note.setAttribute('id', options.id);
}

function setClass(options: ClassUpdate, note: StaveNote) {
  if (!options.class) return;
  const commaSeparatedRegex = /\s*,\s*/;
  options.class.split(commaSeparatedRegex).forEach((className: string) => note.addClass(className));
}

export interface EasyScoreOptions {
  factory?: Factory;
  builder?: Builder;
  commitHooks?: CommitHook[];
  throwOnError?: boolean;
}

export interface EasyScoreDefaults {
  clef: string;
  time: string;
  stem: string;
  // eslint-disable-next-line
  [x: string]: any; // allow arbitrary properties via set(defaults)
}

export class EasyScore {
  static DEBUG: boolean = false;

  defaults: EasyScoreDefaults;
  options!: EasyScoreOptions;
  factory!: Factory;
  builder!: Builder;
  grammar!: Grammar;
  parser!: Parser;

  constructor(options: EasyScoreOptions = {}) {
    this.setOptions(options);
    this.defaults = {
      clef: 'treble',
      time: '4/4',
      stem: 'auto',
    };
  }

  set(defaults: EasyScoreDefaults): this {
    Object.assign(this.defaults, defaults);
    return this;
  }

  setOptions(options: EasyScoreOptions): this {
    this.options = {
      commitHooks: [setId, setClass, Articulation.easyScoreHook, FretHandFinger.easyScoreHook],
      throwOnError: false,
      ...options,
    };

    // eslint-disable-next-line
    this.factory = this.options.factory!; // ! operator, because we know it is set in Factory.EasyScore()
    this.builder = this.options.builder || new Builder(this.factory);
    this.grammar = new Grammar(this.builder);
    this.parser = new Parser(this.grammar);
    // eslint-disable-next-line
    this.options.commitHooks!.forEach((commitHook: CommitHook) => this.addCommitHook(commitHook)); // ! operator, because this.options.commitHooks is set in the first line of this method.
    return this;
  }

  setContext(context: RenderContext): this {
    if (this.factory) this.factory.setContext(context);
    return this;
  }

  parse(line: string, options: BuilderOptions = {}): Result {
    this.builder.reset(options);
    const result = this.parser.parse(line);
    if (!result.success && this.options.throwOnError) {
      throw new X('Error parsing line: ' + line, result);
    }
    return result;
  }

  // TODO: Add stricter typing after migrating Factory
  // eslint-disable-next-line
  beam(notes: StaveNote[], options: any = {}): StaveNote[] {
    this.factory.Beam({ notes, options });
    return notes;
  }

  // TODO: Add stricter typing after migrating Factory
  // eslint-disable-next-line
  tuplet(notes: StaveNote[], options: any = {}): StaveNote[] {
    this.factory.Tuplet({ notes, options });
    return notes;
  }

  notes(line: string, options: BuilderOptions = {}): StaveNote[] {
    options = { clef: this.defaults.clef, stem: this.defaults.stem, ...options };
    this.parse(line, options);
    return this.builder.getElements().notes;
  }

  // TODO: Add stricter typing after migrating Factory
  // eslint-disable-next-line
  voice(notes: StaveNote[], options?: any): Voice {
    options = { time: this.defaults.time, ...options };
    return this.factory.Voice(options).addTickables(notes);
  }

  addCommitHook(commitHook: CommitHook): void {
    this.builder.addCommitHook(commitHook);
  }
}

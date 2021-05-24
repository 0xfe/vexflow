// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a parser for a simple language to generate
// VexFlow objects.

/* eslint max-classes-per-file: "off" */

import { Vex } from './vex';
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
function L(...args: any[]): void {
  if (EasyScore.DEBUG) Vex.L('Vex.Flow.EasyScore', args);
}

export const X = Vex.MakeException('EasyScoreError');

type NoteIDUpdate = { id: string };
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
      run: (state) =>
        this.builder.addSingleNote(
          state!.matches[0] as string,
          state!.matches[1] as string,
          state!.matches[2] as string
        ),
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
      run: (state) => this.builder.setNoteDots(state!.matches),
    };
  }
  TYPE(): Rule {
    return {
      expect: [this.SLASH, this.MAYBESLASH, this.TYPES],
      maybe: true,
      run: (state) => this.builder.setNoteType(state!.matches[2] as string),
    };
  }
  DURATION(): Rule {
    return {
      expect: [this.SLASH, this.DURATIONS],
      maybe: true,
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
  options: any = {};
  constructor(duration: string) {
    this.duration = duration;
  }
}

interface BuilderElements {
  notes: StaveNote[];
  accidentals: Accidental[];
}

interface BuilderOptions {
  stem?: string;
  clef?: string;
  [x: string]: any; // allow arbitrary options via reset(...)
}

export class Builder {
  factory: Factory;
  elements!: BuilderElements;
  options!: BuilderOptions; // TODO: Should BuilderOptions be the same type as EasyScoreDefaults?
  commitHooks: CommitHook[] = [];
  piece!: Piece;
  rollingDuration!: string;

  constructor(factory: Factory) {
    this.factory = factory;
    this.reset();
  }

  reset(options: BuilderOptions = {}) {
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

  getElements() {
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

  setNoteDuration(duration?: string) {
    L('setNoteDuration:', duration);
    this.rollingDuration = this.piece.duration = duration || this.rollingDuration;
  }

  setNoteType(type?: string) {
    L('setNoteType:', type);
    if (type) this.piece.type = type;
  }

  addNoteOption(key: string, value: string) {
    L('addNoteOption: key:', key, 'value:', value);
    this.piece.options[key] = value;
  }

  addNote(key?: string, accid?: string | null, octave?: string) {
    L('addNote:', key, accid, octave);
    this.piece.chord.push({
      key: key as string,
      accid: accid,
      octave: octave,
    });
  }

  addSingleNote(key: string, accid?: string | null, octave?: string) {
    L('addSingleNote:', key, accid, octave);
    this.addNote(key, accid, octave);
  }

  // notes is an array with 3 entries
  addChord(notes: Match[]) {
    L('startChord');
    if (typeof notes[0] !== 'object') {
      this.addSingleNote(notes[0]);
    } else {
      notes.forEach((n: any) => {
        if (n) this.addNote(...n); // n => [string, string | null, string]
      });
    }
    L('endChord');
  }

  commitPiece() {
    L('commitPiece');
    const { factory } = this;

    if (!factory) return;

    const options = { ...this.options, ...this.piece.options };
    const { stem, clef } = options;
    const autoStem = stem.toLowerCase() === 'auto';
    const stemDirection = !autoStem && stem.toLowerCase() === 'up' ? StaveNote.STEM_UP : StaveNote.STEM_DOWN;

    // Build StaveNotes.
    const { chord, duration, dots, type } = this.piece;
    const keys = chord.map((note) => note.key + '/' + note.octave);
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
    const accids = chord.map((note) => note.accid || null);
    accids.forEach((accid, i) => {
      // TODO: Remove "as unknown". This compilation warning will be fixed after factory & accidental are migrated.
      if (accid) note.addAccidental(i, (factory.Accidental({ type: accid }) as unknown) as Modifier);
    });

    // Attach dots.
    for (let i = 0; i < dots; i++) note.addDotToAll();

    this.commitHooks.forEach((fn) => fn(options, note, this));

    this.elements.notes.push(note);
    this.elements.accidentals.concat((accids as unknown) as Accidental[]); // TODO: FIX THIS!
    this.resetPiece();
  }
}

function setId({ id }: NoteIDUpdate, note: StaveNote) {
  if (id === undefined) return;

  note.setAttribute('id', id);
}

function setClass(options: any, note: StaveNote) {
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

interface EasyScoreDefaults {
  clef: string;
  time: string;
  stem: string;
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

    this.factory = this.options.factory!; // ! operator, because we know it is set in Factory.EasyScore()
    this.builder = this.options.builder ?? new Builder(this.factory);
    this.grammar = new Grammar(this.builder);
    this.parser = new Parser(this.grammar);
    this.options.commitHooks!.forEach((commitHook) => this.addCommitHook(commitHook));
    return this;
  }

  setContext(context: RenderContext): this {
    if (this.factory) this.factory.setContext(context);
    return this;
  }

  parse(line: string, options: any = {}): Result {
    this.builder.reset(options);
    const result = this.parser.parse(line);
    if (!result.success && this.options.throwOnError) {
      throw new X('Error parsing line: ' + line, result);
    }
    return result;
  }

  beam(notes: StaveNote[], options: any = {}): StaveNote[] {
    this.factory.Beam({ notes, options });
    return notes;
  }

  tuplet(notes: StaveNote[], options: any = {}): StaveNote[] {
    this.factory.Tuplet({ notes, options });
    return notes;
  }

  notes(line: string, options: any = {}): StaveNote[] {
    options = { clef: this.defaults.clef, stem: this.defaults.stem, ...options };
    this.parse(line, options);
    return this.builder.getElements().notes;
  }

  voice(notes: StaveNote[], options: any): Voice {
    options = { time: this.defaults.time, ...options };
    return this.factory.Voice(options).addTickables(notes);
  }

  addCommitHook(commitHook: CommitHook): void {
    this.builder.addCommitHook(commitHook); // Removed the "return" keyword because the called method has no return statement.
  }
}

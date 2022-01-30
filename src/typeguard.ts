// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License

import { Accidental } from './accidental';
import { Annotation } from './annotation';
import { Dot } from './dot';
import { GraceNote } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { Note } from './note';
import { RenderContext } from './rendercontext.js';
import { Barline } from './stavebarline';
import { StaveNote } from './stavenote';
import { StemmableNote } from './stemmablenote';
import { TabNote } from './tabnote';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Use instead of `instanceof` as a more flexible type guard.
 * @param obj check if this object's CATEGORY matches the provided category.
 * @param category a string representing a category of VexFlow objects.
 * @param checkAncestors defaults to `true`, so we walk up the prototype chain to look for a matching `CATEGORY`.
 *        If `false`, we do not check the superclass or other ancestors.
 * @returns true if `obj` has a static `CATEGORY` property that matches `category`.
 */
export function isCategory<T>(obj: any, category: string, checkAncestors: boolean = true): obj is T {
  // obj is undefined, a number, a primitive string, or null.
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  // `obj.constructor` is a reference to the constructor function that created the `obj` instance.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor
  let constructorFcn = obj.constructor;

  // Check if the object's static .CATEGORY matches the provided category.

  if (checkAncestors) {
    // Walk up the prototype chain to look for a matching obj.constructor.CATEGORY.
    while (obj !== null) {
      constructorFcn = obj.constructor;
      if ('CATEGORY' in constructorFcn && constructorFcn.CATEGORY === category) {
        return true;
      }
      obj = Object.getPrototypeOf(obj);
    }
    return false;
  } else {
    // Do not walk up the prototype chain. Just check this particular object's static .CATEGORY string.
    return 'CATEGORY' in constructorFcn && constructorFcn.CATEGORY === category;
  }
}

export const isAccidental = (obj: unknown): obj is Accidental => isCategory(obj, Category.Accidental);
export const isAnnotation = (obj: unknown): obj is Annotation => isCategory(obj, Category.Annotation);
export const isBarline = (obj: unknown): obj is Barline => isCategory(obj, Category.Barline);
export const isDot = (obj: unknown): obj is Dot => isCategory(obj, Category.Dot);
export const isGraceNote = (obj: unknown): obj is GraceNote => isCategory(obj, Category.GraceNote);
export const isGraceNoteGroup = (obj: unknown): obj is GraceNoteGroup => isCategory(obj, Category.GraceNoteGroup);
export const isNote = (obj: unknown): obj is Note => isCategory(obj, Category.Note);
export const isRenderContext = (obj: unknown): obj is RenderContext => isCategory(obj, Category.RenderContext);
export const isStaveNote = (obj: unknown): obj is StaveNote => isCategory(obj, Category.StaveNote);
export const isStemmableNote = (obj: unknown): obj is StemmableNote => isCategory(obj, Category.StemmableNote);
export const isTabNote = (obj: unknown): obj is TabNote => isCategory(obj, Category.TabNote);

// 'const' enums are erased by the TypeScript compiler. The string values are inlined at all the use sites.
// See: https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
export const enum Category {
  Accidental = 'Accidental',
  Annotation = 'Annotation',
  Articulation = 'Articulation',
  Barline = 'Barline',
  BarNote = 'BarNote',
  Beam = 'Beam',
  Bend = 'Bend',
  ChordSymbol = 'ChordSymbol',
  Clef = 'Clef',
  ClefNote = 'ClefNote',
  Crescendo = 'Crescendo',
  Curve = 'Curve',
  Dot = 'Dot',
  Element = 'Element',
  Fraction = 'Fraction',
  FretHandFinger = 'FretHandFinger',
  GhostNote = 'GhostNote',
  Glyph = 'Glyph',
  GlyphNote = 'GlyphNote',
  GraceNote = 'GraceNote',
  GraceNoteGroup = 'GraceNoteGroup',
  GraceTabNote = 'GraceTabNote',
  KeySignature = 'KeySignature',
  KeySigNote = 'KeySigNote',
  Modifier = 'Modifier',
  MultiMeasureRest = 'MultiMeasureRest',
  Note = 'Note',
  NoteHead = 'NoteHead',
  NoteSubGroup = 'NoteSubGroup',
  Ornament = 'Ornament',
  Parenthesis = 'Parenthesis',
  PedalMarking = 'PedalMarking',
  RenderContext = 'RenderContext',
  RepeatNote = 'RepeatNote',
  Repetition = 'Repetition',
  Stave = 'Stave',
  StaveConnector = 'StaveConnector',
  StaveHairpin = 'StaveHairpin',
  StaveLine = 'StaveLine',
  StaveModifier = 'StaveModifier',
  StaveNote = 'StaveNote',
  StaveSection = 'StaveSection',
  StaveTempo = 'StaveTempo',
  StaveText = 'StaveText',
  StaveTie = 'StaveTie',
  Stem = 'Stem',
  StemmableNote = 'StemmableNote',
  StringNumber = 'StringNumber',
  Stroke = 'Stroke',
  System = 'System',
  TabNote = 'TabNote',
  TabSlide = 'TabSlide',
  TabStave = 'TabStave',
  TabTie = 'TabTie',
  TextBracket = 'TextBracket',
  TextDynamics = 'TextDynamics',
  TextNote = 'TextNote',
  Tickable = 'Tickable',
  TimeSignature = 'TimeSignature',
  TimeSigNote = 'TimeSigNote',
  Tremolo = 'Tremolo',
  Tuplet = 'Tuplet',
  Vibrato = 'Vibrato',
  VibratoBracket = 'VibratoBracket',
  Voice = 'Voice',
  Volta = 'Volta',
}

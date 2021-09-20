// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License

import { Dot } from 'dot';
import { GraceNote } from 'gracenote';
import { GraceNoteGroup } from 'gracenotegroup';
import { Barline } from 'stavebarline';
import { Note } from './note';
import { StaveNote } from './stavenote';
import { StemmableNote } from './stemmablenote';
import { TabNote } from './tabnote';

// Helper functions for checking an object's type, via `instanceof` and `obj.constructor.CATEGORY`.
export const isNote = (obj: unknown): obj is Note => isCategory(obj, Note);
export const isStemmableNote = (obj: unknown): obj is StemmableNote => isCategory(obj, StemmableNote);
export const isStaveNote = (obj: unknown): obj is StaveNote => isCategory(obj, StaveNote);
export const isTabNote = (obj: unknown): obj is TabNote => isCategory(obj, TabNote);
export const isGraceNote = (obj: unknown): obj is GraceNote => isCategory(obj, GraceNote);
export const isGraceNoteGroup = (obj: unknown): obj is GraceNoteGroup => isCategory(obj, GraceNoteGroup);
export const isDot = (obj: unknown): obj is Dot => isCategory(obj, Dot);
export const isBarline = (obj: unknown): obj is Barline => isCategory(obj, Barline);

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * Use instead of `instanceof` as a more flexible type guard.
 * @param obj check if this object is an instance of the provided `cls`.
 * @param cls a JavaScript class, such as `StaveNote`. `cls` is a constructor function, and it has a `prototype` property, and
 *            optionally a `CATEGORY` property (used in VexFlow for flexible type checking).
 * @param checkAncestors defaults to `true`, so we walk up the prototype chain to look for a matching `CATEGORY`.
 *        If `false`, we do not check the superclass or other ancestors.
 * @returns true if `obj` is an instance of `ClassName`, or has a static `CATEGORY` property that matches `ClassName.CATEGORY`.
 */
export function isCategory<T>(
  obj: any,
  cls: Function & { prototype: T; CATEGORY?: string },
  checkAncestors: boolean = true
): obj is T {
  // obj is NOT an instance of cls if it is: undefined, a number, a primitive string, or null.
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  // `obj.constructor` is a reference to the constructor function that created the `obj` instance.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor
  let constructorFcn = obj.constructor;
  if (obj instanceof cls || constructorFcn === cls) {
    return true;
  }

  // If instanceof fails, fall back to checking if the object's static .CATEGORY matches the class's .CATEGORY property.
  const categoryToMatch = cls.CATEGORY;
  if (categoryToMatch === undefined) {
    return false;
  }

  if (checkAncestors) {
    // Walk up the prototype chain to look for a matching obj.constructor.CATEGORY.
    while (obj !== null) {
      constructorFcn = obj.constructor;
      if ('CATEGORY' in constructorFcn && constructorFcn.CATEGORY === categoryToMatch) {
        return true;
      }
      obj = Object.getPrototypeOf(obj);
    }
    return false;
  } else {
    // Do not walk up the prototype chain. Just check this particular object's static .CATEGORY string.
    return 'CATEGORY' in constructorFcn && constructorFcn.CATEGORY === categoryToMatch;
  }
}

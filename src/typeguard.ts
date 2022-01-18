// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */

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

// 'const' enums are erased by the TypeScript compiler. The string values are inlined at all the use sites.
// See: https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
export const enum Category {
  Accidental = 'Accidental',
  Barline = 'Barline',
  Dot = 'Dot',
  GraceNote = 'GraceNote',
  GraceNoteGroup = 'GraceNoteGroup',
  Note = 'Note',
  StaveNote = 'StaveNote',
  StemmableNote = 'StemmableNote',
  TabNote = 'TabNote',
}

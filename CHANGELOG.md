# 4.0.0 / beta

Please help test this beta release and [report issues on GitHub](https://github.com/0xfe/vexflow/issues). Thanks!

## Features

- Migrate VexFlow to **TypeScript** with a ES6 target.

## Breaking

- The tsconfig.json `compilerOptions.target` has been updated to ES6 / ES2015. If you are targeting an older environment, you will need to build directly from source code (and change the target back to ES5).
- `Stave.setNumLines(n: number)` requires a number. Previously, a string would also work. See: [stave.ts](https://github.com/0xfe/vexflow/blob/master/src/stave.ts) and [#1083](https://github.com/0xfe/vexflow/issues/1083).
- `Note.addModifier(modifier: Modifier, index?: number): this` now throws a RuntimeError if the parameters are reversed.
- `TickContext.getTickableForVoice(voiceIndex: number): Tickable` was previously named `getTickablesForVoice(voiceIndex: number): Note`. We removed the `s` because the method returns a single Tickable. You will need to update calls to this function if you are upgrading from a build from between April 2020 to August 2021.
- `Element` and its subclasses have a static `CATEGORY` string property, used by VexFlow internally to differentiate objects. This string has been standardized to be singular, with UpperCamelCase capitalization.
  - Examples:
    - `Accidental.CATEGORY` is now `'Accidental'` instead of `'accidentals'`.
    - `Modifier.CATEGORY` is now `'Modifier'` instead of `'none'`.
- `ChordSymbol.NO_TEXT_FORMAT` was previously named `ChordSymbol.NOTEXTFORMAT`.

# 3.0.9 / 2020-04-21

- Support [Bravura](https://github.com/steinbergmedia/bravura), the reference font for [Standard Music Font Layout](https://w3c.github.io/smufl/latest/index.html).

# 1.2.84 / 2017-08-01

- `Accidental.ApplyAccidentals()` no longer breaks on `Notes` that ignore ticks (ie: `TimeSigNote`)
- `Accidental.applyAccidentals()` now applies accidentals to `GraceNotes`
- Fix a `BoundingBox#mergeWith` case when one box contains another
- Fix blurry canvas rendering on retina screens
- Rebuild noteheads after `StaveNote#setKeyLine` is called
- Ensure `StaveNote.extraLeftPx` and `StaveNote.extraRightPx` get recalculated in `StaveNote#reset`
- `Factory` exposes a lot more elements -- **API is subject to change**
- `Factory` constructor `options.renderer.selector` renamed to `options.renderer.elementId` to more appropriately reflect the what the string represents
- Sori and koron microtonal accidentals have been added
- Tests have been refactored to use `Factory` and `EasyScore`
- The font transformation tool (`transform.html`) has been refactored, and generates a font by combining both the `Gonville` and `Microtonal` fonts.

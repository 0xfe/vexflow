# 4.0.1

Detailed changes are listed on the wiki: https://github.com/0xfe/vexflow/wiki/Changelog-ver-4.0

## Features

- VexFlow is written in **TypeScript** with a ES6 target.
- Supports ES module in addition to CommonJS environments.
- Improved automatic layout of notes.
- Improved handling of music fonts and text fonts.
- Supports lazy loading of music fonts.
- Improved `setFont(...)` method in Element class.

## Breaking

- The tsconfig.json `compilerOptions.target` has been updated to ES6 / ES2015.
- `Stave.setNumLines(n: number)` requires a number. Previously, a string would also work. See: [stave.ts](https://github.com/0xfe/vexflow/blob/master/src/stave.ts) and [#1083](https://github.com/0xfe/vexflow/issues/1083).
- `Note.addModifier(modifier: Modifier, index?: number): this` now throws a RuntimeError if the parameters are reversed.
- `TickContext.getTickableForVoice(voiceIndex: number): Tickable` was previously named `getTickablesForVoice(voiceIndex: number): Note`. We removed the `s` because the method returns a single Tickable. You will need to update calls to this function if you are upgrading from a build from between April 2020 to August 2021.
- `Element` and its subclasses have a static `CATEGORY` string property, used by VexFlow internally to differentiate objects. This string has been standardized to be singular, with UpperCamelCase capitalization.
  - Examples:
    - `Accidental.CATEGORY` is now `'Accidental'` instead of `'accidentals'`.
    - `Modifier.CATEGORY` is now `'Modifier'` instead of `'none'`.
- **ChordSymbol**
  - `ChordSymbol.NO_TEXT_FORMAT` was previously named `ChordSymbol.NOTEXTFORMAT`.
  - `ChordSymbol.metrics` was previously named `ChordSymbol.chordSymbolMetrics`.
- `StaveNote.LEDGER_LINE_OFFSET` was previously named `StaveNote.DEFAULT_LEDGER_LINE_OFFSET`.
- **Fonts**

  - `TextFontMetrics` has been merged into `FontGlyph` due to substantial overlap.
  - `Flow.NOTATION_FONT_SCALE` was previously named `Flow.DEFAULT_NOTATION_FONT_SCALE`.
  - `setFont(...)` in `CanvasContext` and `SVGContext` previously took arguments: `family`, `size`, `weight`. The `weight` argument allowed strings like `'italic bold'`. This no longer works, and `'italic'` must now be passed into the `style` argument.

- **Build Process**
  - Gruntfile environment variable `VEX_DEVTOOL` was previously named `VEX_GENMAP`. This environment variable sets the [webpack devtool configuration option](https://webpack.js.org/configuration/devtool/).

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

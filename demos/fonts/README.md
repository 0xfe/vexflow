# Fonts

## all.html

The full `vexflow.js` includes the following music engraving fonts: Bravura, Petaluma, Gonville, and Custom. In this case, `Vex.Flow.setMusicFont('Bravura', ...);` is a synchronous function that changes the current font stack.

## with-bravura.html

This page uses `vexflow-bravura.js`, which statically bundles only the Bravura font. You do not need to call `Flow.setMusicFont(...)`.

## with-gonville.html

This page uses `vexflow-gonville.js`, which statically bundles only the Gonville font. You do not need to call `Flow.setMusicFont(...)`.

## with-petaluma.html

This page uses `vexflow-petaluma.js`, which statically bundles only the Petaluma font. You do not need to call `Flow.setMusicFont(...)`.

## core.html

This page depends on `vexflow-core.js` and the individual font bundles:

```
vexflow-font-bravura.js
vexflow-font-gonville.js
vexflow-font-petaluma.js
vexflow-font-custom.js
```

`core.html` uses the await keyword to call an async function that returns after the requested font is loaded:

```
await Vex.Flow.setMusicFont('Petaluma');
```

**IMPORTANT**: The default font stack is empty, so you **must** call `Flow.setMusicFont(...)` before rendering your score.

## core-with-promise.html

The async `Vex.Flow.setMusicFont(...)` returns a Promise. This demo shows how to use a `.then(onFulfilledCallback)` to request a font stack, and initialize VexFlow once the fonts are ready.

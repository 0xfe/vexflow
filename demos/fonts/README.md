# Fonts

## all.html

The full `vexflow.js` includes the following music engraving fonts: Bravura, Petaluma, Gonville, and Custom. In this case, `Vex.Flow.setMusicFont('Bravura', ...);` is a synchronous function that changes the current font stack.

## core.html

These files depends on `vexflow-core.js` and the individual font JS files:

```
vexflow-font-bravura.js
vexflow-font-gonville.js
vexflow-font-petaluma.js
vexflow-font-custom.js
```

`core.html` uses the await keyword to call an async function that returns once the requested font is successfully loaded:

```
await Vex.Flow.setMusicFont('Petaluma');`
```

## core-with-promise.html

The async `Vex.Flow.setMusicFont(...)` returns a Promise. This demo shows how to use a `.then(onFulfilledCallback)` to request a font stack, and initialize VexFlow once the fonts are ready.

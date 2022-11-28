# Fonts

## all.html

The full `vexflow.js` includes the following music engraving fonts: Bravura, Petaluma, Gonville, Leland, and Custom. In this case, `Vex.Flow.setMusicFont('Bravura', ...);` is a synchronous function that changes the current font stack.

## bravura.html

This page uses `vexflow-bravura.js`, which statically bundles only the Bravura font. You do not need to call `Flow.setMusicFont(...)`.

## gonville.html

This page uses `vexflow-gonville.js`, which statically bundles only the Gonville font. You do not need to call `Flow.setMusicFont(...)`.

## petaluma.html

This page uses `vexflow-petaluma.js`, which statically bundles only the Petaluma font. You do not need to call `Flow.setMusicFont(...)`.

## leland.html

This page uses `vexflow-leland.js`, which statically bundles only the Leland font. You do not need to call `Flow.setMusicFont(...)`.

## core.html

This page depends on `vexflow-core.js` and the individual font bundles:

```
vexflow-font-bravura.js
vexflow-font-gonville.js
vexflow-font-leland.js
vexflow-font-petaluma.js
vexflow-font-custom.js
```

`core.html` uses the <b>await</b> keyword to call an async function that returns after the requested font is loaded:

```
await Vex.Flow.setMusicFont('Petaluma');
```

**IMPORTANT**: The default font stack is empty, so you **must** call `Flow.setMusicFont(...)` before rendering your score.

## core-with-promise.html

The async `Vex.Flow.setMusicFont(...)` returns a Promise. This demo shows how to use a `.then(onFulfilledCallback)` to request a font stack, and initialize VexFlow once the fonts are ready.

## font-module.html

This demonstrates that each font module file (vexflow-font-xxx.js) loads properly. As each font loads, it adds its own data to the global VexFlowFont object.

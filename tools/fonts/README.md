## Font Generation Scripts

### Generate Gonville fonts

To add a new Gonville glyph to Vexflow, add the glyph code along with SMuFL name to `config/valid_codes.json`. Then run the following:

```sh
$ node fontgen_gonville.js ../../src/fonts/
```

### Generate SMuFL font

To add a new SMuFL glyph to Vexflow, add the SMuFL code with the Gonville backup code to `config/valid_codes.json`. Then run the following:

```sh
# Generate Bravura glyphs
$ node fontgen_smufl.js @/bravura/Bravura_1.392.otf ../../src/fonts/bravura_glyphs.ts

# Generate Petaluma glyphs
$ node fontgen_smufl.js @/petaluma/Petaluma_1.065.otf ../../src/fonts/petaluma_glyphs.ts

# Generate Gonville glyphs
$ node fontgen_gonville.js @/gonville/Gonville-18_20200703.otf../../src/fonts/gonville_glyphs.ts
```

### Add Custom Glyph

To add a custom glyph, add its outline to `fonts/custom_glyphs.js` and a custom code (with the `vex` prefix) to `config/valid_codes.json`. Then run the following.

```sh
$ node fontgen_gonville.js ../../src/fonts/
```

### Generate Text Metrics for a Text Font

To create text metrics for your own font, first obtain an open-type font (.otf) version of the font file. Then run:

```sh
$ node textmetrics_fontgen.js myFont.otf myFont_textmetrics.json
```

You can register your metrics using `TextFormatter.registerFont()` and the metrics will be available for your module. See the `chordsymbol.ts` module for examples.

## Other Info

`Gonville-18_20110919.otf` is a font file containing metadata (`FontForge 2.0 : Gonville-18 : 19-9-2011`) which suggests that it was generated on September 19, 2011. The version number is 0.1.9313.

The same file is found here: https://github.com/OpenLilyPondFonts/gonville/blob/5a88abdd5f99ebe6a4b601d2a8c3d63ae485451e/otf/gonville-18.otf

Some version of Gonville has been used by VexFlow since 2010 or before. See: https://github.com/0xfe/vexflow/tree/8c10ac8aee4cd92f71786ae1c6cd751497bcb753/src/fonts

Gonville was designed by Simon Tatham. The most recent version of Gonville can be downloaded at: https://www.chiark.greenend.org.uk/~sgtatham/gonville/ See the LICENCE file here: https://git.tartarus.org/?p=simon/gonville.git;a=blob_plain;f=LICENCE;hb=HEAD

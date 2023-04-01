## Font Generation Scripts

### Generate SMuFL font

To add a new SMuFL glyph to Vexflow, add the SMuFL code with the Gonville backup code to `config/valid_codes.json`. Then run the following:

```sh
# Generate Gonville glyphs
$ ./gonville2smufl.py @/gonville/Gonville-18_20200703.otf @/gonville/GonvilleSmufl.otf
$ node fontgen_smufl.js @/gonville/GonvilleSmufl.otf ../../src/fonts/gonville_glyphs.ts

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
$ node fontgen_custom.js ../../src/fonts/
```

### Generate Text Metrics for a Text Font

To create text metrics for your own font, first obtain a font file (e.g., \*.otf). Then run:

```sh
$ node fontgen_text.js MyFont.otf myfont_glyphs.ts
```

You can register these metrics using `TextFormatter.registerInfo(...)` and the metrics will be available for your module. See `chordsymbol.ts` for examples.

## Gonville

The Gonville font was designed by Simon Tatham. It has been used by VexFlow [since 2010](https://github.com/0xfe/vexflow/tree/8c10ac8aee4cd92f71786ae1c6cd751497bcb753/src/fonts).

VexFlow uses Gonville version 0.1.8904 from March 17, 2010, with metadata: `FontForge 2.0 : Gonville-18 : 17-3-2010`. See the `original_font_information` field in these files:

- `src/fonts/gonville_glyphs.ts`
- `tools/fonts/other/gonville.js`
- `tools/fonts/legacy/gonville_all.ts`
- `tools/fonts/legacy/gonville_original.ts`

We no longer have access to the original font file. The archived website is at: https://web.archive.org/web/20100516030737/https://www.chiark.greenend.org.uk/~sgtatham/gonville/

The closest release we have is `Gonville-18_20110919.otf`, a font file containing metadata `FontForge 2.0 : Gonville-18 : 19-9-2011` which suggests that it was generated on September 19, 2011. The version number is 0.1.9313. The same file is found here: https://github.com/OpenLilyPondFonts/gonville/blob/5a88abdd5f99ebe6a4b601d2a8c3d63ae485451e/otf/gonville-18.otf

We include a recent version of Gonville, from July 2020: `Gonville-18_20200703.otf`.

The Gonville website: https://www.chiark.greenend.org.uk/~sgtatham/gonville/

The Gonville LICENSE file: https://git.tartarus.org/?p=simon/gonville.git;a=blob_plain;f=LICENCE;hb=HEAD

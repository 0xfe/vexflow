## Font Generation Scripts

### Generate Gonville fonts

To add a new Gonville glyph to Vexflow, add the glyph code along with SMuFL name to `config/valid_codes.json`. Then run the following.

```sh
$ node gonville_fontgen.js ../../src/fonts/
```

### Generate SMuFL (Bravura) font

To add a new SMuFL glyph to Vexflow, add the SMuFL code with the Gonville backup code to `config/valid_codes.json`. Then run the following.

```sh
# Generate Bravura glyphs for Vexflow
$ node bravura_fontgen.js fonts/Bravura.otf ../../src/fonts/bravura_glyphs.js

# Generate Gonville glyphs for SMuFL code
$ node gonville_fontgen.js ../../src/fonts/
```

### Add Custom Glyph

To add a custom glyph, add it's outline to `fonts/custom_glyphs.js` and a custom code (with the `vex` prefix) to `config/valid_codes.json`. Then run the following.

```sh
$ node gonville_fontgen.js ../../src/fonts/
```
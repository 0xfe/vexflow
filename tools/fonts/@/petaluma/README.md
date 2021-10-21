The official PetalumaScript woff files seem to have poor kerning.

- PetalumaScript_1.10.woff
- PetalumaScript_1.10.woff2

So instead, we used FontSquirrel https://www.fontsquirrel.com/tools/webfont-generator to convert the OTF file to woff/woff2 files. This produced better results.

**FontSquirrel Settings (EXPERT...)**

- Font Formats: WOFF, WOFF2
- Truetype Hinting: Keep Existing
- Rendering: Uncheck all boxes.
- Vertical Metrics: No Adjustment
- Fix Missing Glyphs: Uncheck all boxes.
- X-height Matching: None
- Protection: None
- Subsetting: No Subsetting
- OpenType Flattening: Uncheck all boxes.
- CSS: Uncheck all boxes.
- Advanced Options
  - Font Name Suffix: Leave the text box empty.
  - Em Square Value: 1000
  - Adjust Glyph Spacing: 0

The FontSquirrel output is saved as:

- PetalumaScript_1.10_FS.woff
- PetalumaScript_1.10_FS.woff2

FontSquirrel also changes the fullName field from `PetalumaScript` to `Petaluma Script Regular`.

TODO: Someday, write a script in opentype.js to replicate this (in case FontSquirrel no longer exists).

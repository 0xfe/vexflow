/**
 * VexFlow - Rhythm Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Rhythm = {}

Vex.Flow.Test.Rhythm.Start = function() {
  module("Rhythm");

  Vex.Flow.Test.runTests("Rhythm Draw - slash notes",
    Vex.Flow.Test.Rhythm.drawBasic);
  Vex.Flow.Test.runTests("Rhythm Draw - beamed slash notes",
    Vex.Flow.Test.Rhythm.drawBeamedSlashNotes);
  Vex.Flow.Test.runTests("Rhythm Draw - beamed slash notes, some rests",
    Vex.Flow.Test.Rhythm.drawSlashAndBeamAndRests);
  Vex.Flow.Test.runTests("Rhythm Draw - 16th note rhythm with scratches",
    Vex.Flow.Test.Rhythm.drawSixtenthWithScratches);
  Vex.Flow.Test.runTests("Rhythm Draw - 32nd note rhythm with scratches",
    Vex.Flow.Test.Rhythm.drawThirtySecondWithScratches);
}

Vex.Flow.Test.Rhythm.drawSlash = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 350, 180);
  var stave = new Vex.Flow.Stave(10, 10, 350);
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { keys: ["b/4"], duration: "ws", stem_direction: -1},
    { keys: ["b/4"], duration: "hs", stem_direction: -1},
    { keys: ["b/4"], duration: "qs", stem_direction: -1},
    { keys: ["b/4"], duration: "8s", stem_direction: -1},
    { keys: ["b/4"], duration: "16s", stem_direction: -1},
    { keys: ["b/4"], duration: "32s", stem_direction: -1},
    { keys: ["b/4"], duration: "64s", stem_direction: -1}
  ];
  expect(notes.length * 2);

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.Rhythm.drawBasic = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 150);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 150);
  staveBar1.setBegBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.SINGLE);
  staveBar1.addClef("treble")
  staveBar1.addTimeSignature("4/4");
  staveBar1.addKeySignature("C");
  staveBar1.setContext(ctx).draw();

  var notesBar1 = [
    new Vex.Flow.StaveNote(
        { keys: ["b/4"], duration: "1s", stem_direction: -1 })
  ];

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2 - juxtaposing second bar next to first bar
  var staveBar2 = new Vex.Flow.Stave(staveBar1.width + staveBar1.x,
                                     staveBar1.y, 120);
  staveBar2.setBegBarType(Vex.Flow.Barline.type.SINGLE);
  staveBar2.setEndBarType(Vex.Flow.Barline.type.SINGLE);
  staveBar2.setContext(ctx).draw();

  // bar 2
  var notesBar2 = [
    new Vex.Flow.StaveNote(
        { keys: ["b/4"], duration: "2s",stem_direction: -1 }),
    new Vex.Flow.StaveNote(
        { keys: ["b/4"], duration: "2s",stem_direction: -1 })
  ];

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);


  // bar 3 - juxtaposing second bar next to first bar
  var staveBar3 = new Vex.Flow.Stave(staveBar2.width + staveBar2.x,
                                     staveBar2.y, 170);
  staveBar3.setContext(ctx).draw();

  // bar 3
  var notesBar3 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4s",
                             stem_direction: -1 })
  ];

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

  // bar 4 - juxtaposing second bar next to first bar
  var staveBar4 = new Vex.Flow.Stave(staveBar3.width + staveBar3.x,
                                     staveBar3.y, 200);
  staveBar4.setContext(ctx).draw();

  // bar 4
  var notesBar4 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 })

  ];

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
  expect(0);
}

Vex.Flow.Test.Rhythm.drawBeamedSlashNotes = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 150);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 300);
  staveBar1.setBegBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.SINGLE);
  staveBar1.addClef("treble")
  staveBar1.addTimeSignature("4/4");
  staveBar1.addKeySignature("C");
  staveBar1.setContext(ctx).draw();


  // bar 4
  var notesBar1_part1 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 })
  ];

  var notesBar1_part2 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 })

  ];

  // create the beams for 8th notes in 2nd measure
  var beam1 = new Vex.Flow.Beam(notesBar1_part1);
  var beam2 = new Vex.Flow.Beam(notesBar1_part2);
  var notesBar1 = notesBar1_part1.concat(notesBar1_part2);

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

    // Render beams
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  expect(0);
}

Vex.Flow.Test.Rhythm.drawSlashAndBeamAndRests  = function(options,
                                                          contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 150);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 300);
  staveBar1.setBegBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.SINGLE);
  staveBar1.addClef("treble")
  staveBar1.addTimeSignature("4/4");
  staveBar1.addKeySignature("F");
  staveBar1.setContext(ctx).draw();

  // bar 1
  var notesBar1_part1 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",stem_direction: -1 })
  ];

  notesBar1_part1[0].addModifier(0, (new Vex.Flow.Annotation("C7")).setFont(
        "Times", Vex.Flow.Test.Font.size + 2));

  var notesBar1_part2 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8r",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8r",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8r",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8s",
                             stem_direction: -1 })

  ];

  // create the beams for 8th notes in 2nd measure
  var beam1 = new Vex.Flow.Beam(notesBar1_part1);

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1,
                                   notesBar1_part1.concat(notesBar1_part2));

    // Render beams
  beam1.setContext(ctx).draw();

    // bar 2 - juxtaposing second bar next to first bar
  var staveBar2 = new Vex.Flow.Stave(staveBar1.width + staveBar1.x,
                                     staveBar1.y, 220);
  staveBar2.setContext(ctx).draw();

  var notesBar2 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "1s", 
                             stem_direction: -1 })
  ];

  notesBar2[0].addModifier(0, (new Vex.Flow.Annotation("F")).setFont("Times",
          Vex.Flow.Test.Font.size + 2));
  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

  expect(0);
}

Vex.Flow.Test.Rhythm.drawSixtenthWithScratches  = function(options,
                                                           contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 150);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 300);
  staveBar1.setBegBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.SINGLE);
  staveBar1.addClef("treble")
  staveBar1.addTimeSignature("4/4");
  staveBar1.addKeySignature("F");
  staveBar1.setContext(ctx).draw();

  // bar 1
  var notesBar1_part1 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16m",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16s",
                             stem_direction: -1 })
  ];

  var notesBar1_part2 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16m",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16s",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16r",
                             stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16s",
                             stem_direction: -1 })

  ];

  notesBar1_part1[0].addModifier(0, (new Vex.Flow.Annotation("C7")).setFont(
        "Times", Vex.Flow.Test.Font.size + 3));

  // create the beams for 8th notes in 2nd measure
  var beam1 = new Vex.Flow.Beam(notesBar1_part1);
  var beam2 = new Vex.Flow.Beam(notesBar1_part2);

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1,
                                   notesBar1_part1.concat(notesBar1_part2));


    // Render beams
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  expect(0);
}


Vex.Flow.Test.Rhythm.drawThirtySecondWithScratches  = function(options,
                                                               contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 150);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 300);
  staveBar1.setBegBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.SINGLE);
  staveBar1.addClef("treble")
  staveBar1.addTimeSignature("4/4");
  staveBar1.addKeySignature("F");
  staveBar1.setContext(ctx).draw();

  // bar 1
  var notesBar1_part1 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "32s",
                             stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "32s",
                             stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "32m",
                             stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "32s",
                             stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "32m",
                             stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "32s",
                             stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "32r",
                             stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "32s",
                             stem_direction: 1 })

  ];

  notesBar1_part1[0].addModifier(0, (new Vex.Flow.Annotation("C7")).setFont(
        "Times", Vex.Flow.Test.Font.size + 3));

  // create the beams for 8th notes in 2nd measure
  var beam1 = new Vex.Flow.Beam(notesBar1_part1);

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);

    // Render beams
  beam1.setContext(ctx).draw();

  expect(0);
}

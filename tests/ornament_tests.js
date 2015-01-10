/*
  VexFlow - Copyright Mohit Cheppudira 2010
  Author: Cyril Silverman
*/

Vex.Flow.Test.Ornament = {};

Vex.Flow.Test.Ornament.Start = function() {
  module("Ornament");
  Vex.Flow.Test.runTests("Ornaments", Vex.Flow.Test.Ornament.drawOrnaments);
  

  Vex.Flow.Test.runTests("Ornaments Vertically Shifted", Vex.Flow.Test.Ornament.drawOrnamentsDisplaced);

  Vex.Flow.Test.runTests("Ornaments - Delayed turns", Vex.Flow.Test.Ornament.drawOrnamentsDelayed);
  Vex.Flow.Test.runTests("Stacked", Vex.Flow.Test.Ornament.drawOrnamentsStacked);
  Vex.Flow.Test.runTests("With Upper/Lower Accidentals", Vex.Flow.Test.Ornament.drawOrnamentsWithAccidentals);
};

Vex.Flow.Test.Ornament.drawOrnaments = function(options, contextBuilder) {
  expect(0);

  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 750, 195);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 700);
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 })
  ];

  notesBar1[0].addModifier(0, new Vex.Flow.Ornament("mordent"));
  notesBar1[1].addModifier(0, new Vex.Flow.Ornament("mordent_inverted"));
  notesBar1[2].addModifier(0, new Vex.Flow.Ornament("turn"));
  notesBar1[3].addModifier(0, new Vex.Flow.Ornament("turn_inverted"));
  notesBar1[4].addModifier(0, new Vex.Flow.Ornament("tr"));
  notesBar1[5].addModifier(0, new Vex.Flow.Ornament("upprall"));
  notesBar1[6].addModifier(0, new Vex.Flow.Ornament("downprall"));
  notesBar1[7].addModifier(0, new Vex.Flow.Ornament("prallup"));
  notesBar1[8].addModifier(0, new Vex.Flow.Ornament("pralldown"));
  notesBar1[9].addModifier(0, new Vex.Flow.Ornament("upmordent"));
  notesBar1[10].addModifier(0, new Vex.Flow.Ornament("downmordent"));
  notesBar1[11].addModifier(0, new Vex.Flow.Ornament("lineprall"));
  notesBar1[12].addModifier(0, new Vex.Flow.Ornament("prallprall"));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
}

Vex.Flow.Test.Ornament.drawOrnamentsDisplaced = function(options, contextBuilder) {
  expect(0);

  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 750, 195);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 700);
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
  ];

  notesBar1[0].addModifier(0, new Vex.Flow.Ornament("mordent"));
  notesBar1[1].addModifier(0, new Vex.Flow.Ornament("mordent_inverted"));
  notesBar1[2].addModifier(0, new Vex.Flow.Ornament("turn"));
  notesBar1[3].addModifier(0, new Vex.Flow.Ornament("turn_inverted"));
  notesBar1[4].addModifier(0, new Vex.Flow.Ornament("tr"));
  notesBar1[5].addModifier(0, new Vex.Flow.Ornament("upprall"));
  notesBar1[6].addModifier(0, new Vex.Flow.Ornament("downprall"));
  notesBar1[7].addModifier(0, new Vex.Flow.Ornament("prallup"));
  notesBar1[8].addModifier(0, new Vex.Flow.Ornament("pralldown"));
  notesBar1[9].addModifier(0, new Vex.Flow.Ornament("upmordent"));
  notesBar1[10].addModifier(0, new Vex.Flow.Ornament("downmordent"));
  notesBar1[11].addModifier(0, new Vex.Flow.Ornament("lineprall"));
  notesBar1[12].addModifier(0, new Vex.Flow.Ornament("prallprall"));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
}

Vex.Flow.Test.Ornament.drawOrnamentsDelayed = function(options, contextBuilder) {
  expect(0);

  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 550, 195);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 500);
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
  ];

  notesBar1[0].addModifier(0, new Vex.Flow.Ornament("turn").setDelayed(true));
  notesBar1[1].addModifier(0, new Vex.Flow.Ornament("turn_inverted").setDelayed(true));
  notesBar1[2].addModifier(0, new Vex.Flow.Ornament("turn_inverted").setDelayed(true));
  notesBar1[3].addModifier(0, new Vex.Flow.Ornament("turn").setDelayed(true));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
}

Vex.Flow.Test.Ornament.drawOrnamentsStacked = function(options, contextBuilder) {
  expect(0);

  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 550, 195);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 500);
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
  ];

  notesBar1[0].addModifier(0, new Vex.Flow.Ornament("mordent"));
  notesBar1[1].addModifier(0, new Vex.Flow.Ornament("turn_inverted"));
  notesBar1[2].addModifier(0, new Vex.Flow.Ornament("turn"));
  notesBar1[3].addModifier(0, new Vex.Flow.Ornament("turn_inverted"));

  notesBar1[0].addModifier(0, new Vex.Flow.Ornament("turn"));
  notesBar1[1].addModifier(0, new Vex.Flow.Ornament("prallup"));
  notesBar1[2].addModifier(0, new Vex.Flow.Ornament("upmordent"));
  notesBar1[3].addModifier(0, new Vex.Flow.Ornament("lineprall"));


  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
}

Vex.Flow.Test.Ornament.drawOrnamentsWithAccidentals = function(options, contextBuilder) {
  expect(0);

  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel,650, 250);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 60, 600);
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 })
  ];

  notesBar1[0].addModifier(0, new Vex.Flow.Ornament("mordent").setUpperAccidental("#").setLowerAccidental("#"));
  notesBar1[1].addModifier(0, new Vex.Flow.Ornament("turn_inverted").setLowerAccidental("b").setUpperAccidental("b"));
  notesBar1[2].addModifier(0, new Vex.Flow.Ornament("turn").setUpperAccidental("##").setLowerAccidental("##"));
  notesBar1[3].addModifier(0, new Vex.Flow.Ornament("mordent_inverted").setLowerAccidental("db").setUpperAccidental("db"));
  notesBar1[4].addModifier(0, new Vex.Flow.Ornament("turn_inverted").setUpperAccidental("++").setLowerAccidental("++"));
  notesBar1[5].addModifier(0, new Vex.Flow.Ornament("tr").setUpperAccidental("n").setLowerAccidental("n"));
  notesBar1[6].addModifier(0, new Vex.Flow.Ornament("prallup").setUpperAccidental("d").setLowerAccidental('d'));
  notesBar1[7].addModifier(0, new Vex.Flow.Ornament("lineprall").setUpperAccidental("db").setLowerAccidental('db'));
  notesBar1[8].addModifier(0, new Vex.Flow.Ornament("upmordent").setUpperAccidental("bbs").setLowerAccidental('bbs'));
  notesBar1[9].addModifier(0, new Vex.Flow.Ornament("prallprall").setUpperAccidental("bb").setLowerAccidental('bb'));
  notesBar1[10].addModifier(0, new Vex.Flow.Ornament("turn_inverted").setUpperAccidental("+").setLowerAccidental('+'));



  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
}
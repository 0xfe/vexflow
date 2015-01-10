/**
 * VexFlow - Basic Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

Vex.Flow.Test.Articulation = {}

Vex.Flow.Test.Articulation.Start = function() {
  module("Stave");
  Vex.Flow.Test.Articulation.runTests("Articulation - Staccato/Staccatissimo",
    "a.","av", Vex.Flow.Test.Articulation.drawArticulations);
  Vex.Flow.Test.Articulation.runTests("Articulation - Accent/Tenuto",
    "a>","a-", Vex.Flow.Test.Articulation.drawArticulations);
  Vex.Flow.Test.Articulation.runTests("Articulation - Marcato/L.H. Pizzicato",
    "a^","a+", Vex.Flow.Test.Articulation.drawArticulations);
  Vex.Flow.Test.Articulation.runTests("Articulation - Snap Pizzicato/Fermata",
    "ao","ao", Vex.Flow.Test.Articulation.drawArticulations);
  Vex.Flow.Test.Articulation.runTests("Articulation - Up-stroke/Down-Stroke",
    "a|","am", Vex.Flow.Test.Articulation.drawArticulations);
  Vex.Flow.Test.Articulation.runTests("Articulation - Fermata Above/Below",
    "a@a","a@u",Vex.Flow.Test.Articulation.drawFermata);
  Vex.Flow.Test.Articulation.runTests("Articulation - Inline/Multiple",
    "a.","a.", Vex.Flow.Test.Articulation.drawArticulations2);
  Vex.Flow.Test.Articulation.runTests("TabNote Articulation",
    "a.","a.", Vex.Flow.Test.Articulation.tabNotes);
}

Vex.Flow.Test.Articulation.runTests = function(name, sym1, sym2, func, params) {
  if(Vex.Flow.Test.RUN_CANVAS_TESTS) {
    Vex.Flow.Test.Articulation.runCanvasTest(name, sym1, sym2, func, params);
  }
  if(Vex.Flow.Test.RUN_SVG_TESTS) {
    Vex.Flow.Test.Articulation.runSVGTest(name, sym1, sym2, func, params);
  }
  if(Vex.Flow.Test.RUN_RAPHAEL_TESTS) {
    Vex.Flow.Test.Articulation.runRaphaelTest(name, sym1, sym2, func, params);
  }
}


Vex.Flow.Test.Articulation.runCanvasTest = function(name, sym1, sym2, func, params) {
  test(name, function() {
      var test_canvas_sel = "canvas_" + Vex.Flow.Test.genID();
      Vex.Flow.Test.createTestCanvas(test_canvas_sel, name);
      func({ canvas_sel: test_canvas_sel, params: params },
        Vex.Flow.Renderer.getCanvasContext, sym1, sym2);
    });
}

Vex.Flow.Test.Articulation.runRaphaelTest = function(name, sym1, sym2, func, params) {
  test(name, function() {
      var test_canvas_sel = "canvas_" + Vex.Flow.Test.genID();
      Vex.Flow.Test.createTestSVGorRaphael(test_canvas_sel, name);
      func({ canvas_sel: test_canvas_sel, params: params },
        Vex.Flow.Renderer.getRaphaelContext, sym1, sym2);
    });
}

Vex.Flow.Test.Articulation.runSVGTest = function(name, sym1, sym2, func, params) {
  test(name, function() {
      var test_canvas_sel = "canvas_" + Vex.Flow.Test.genID();
      Vex.Flow.Test.createTestSVGorRaphael(test_canvas_sel, name);
      func({ canvas_sel: test_canvas_sel, params: params },
        Vex.Flow.Renderer.getSVGContext, sym1, sym2);
    });
}



Vex.Flow.Test.Articulation.drawArticulations = function(options, contextBuilder, sym1, sym2) {
  expect(0);

  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 625, 195);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 125);
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["a/3"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 })
  ];
  notesBar1[0].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(4));
  notesBar1[1].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(4));
  notesBar1[2].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(3));
  notesBar1[3].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2 - juxtaposing second bar next to first bar
  var staveBar2 = new Vex.Flow.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 125);
  staveBar2.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar2.setContext(ctx).draw();

  var notesBar2 = [
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
  ];
  notesBar2[0].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(3));
  notesBar2[1].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(3));
  notesBar2[2].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(4));
  notesBar2[3].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

  // bar 3 - juxtaposing second bar next to first bar
    var staveBar3 = new Vex.Flow.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 125);
  staveBar3.setContext(ctx).draw();

  var notesBar3 = [
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 })
  ];
  notesBar3[0].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(4));
  notesBar3[1].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(4));
  notesBar3[2].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(3));
  notesBar3[3].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
  // bar 4 - juxtaposing second bar next to first bar
  var staveBar4 = new Vex.Flow.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 125);
  staveBar4.setEndBarType(Vex.Flow.Barline.type.END);
  staveBar4.setContext(ctx).draw();

  var notesBar4 = [
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
  ];
  notesBar4[0].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(3));
  notesBar4[1].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(3));
  notesBar4[2].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(4));
  notesBar4[3].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
}

Vex.Flow.Test.Articulation.drawFermata = function(options, contextBuilder, sym1, sym2) {
  expect(0);

  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 400, 200);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(50, 30, 150);
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "q", stem_direction: -1 })
  ];
  notesBar1[0].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(3));
  notesBar1[1].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(3));
  notesBar1[2].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(4));
  notesBar1[3].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2 - juxtaposing second bar next to first bar
  var staveBar2 = new Vex.Flow.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 150);
  staveBar2.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar2.setContext(ctx).draw();

  var notesBar2 = [
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
  ];
  notesBar2[0].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(3));
  notesBar2[1].addArticulation(0, new Vex.Flow.Articulation(sym1).setPosition(3));
  notesBar2[2].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(4));
  notesBar2[3].addArticulation(0, new Vex.Flow.Articulation(sym2).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
}

Vex.Flow.Test.Articulation.drawArticulations2 = function(options, contextBuilder, sym1, sym2) {
  expect(0);

  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 725, 200);

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 30, 250);
  staveBar1.setContext(ctx).draw();
  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["e/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["g/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["d/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["e/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["g/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/6"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["d/6"], duration: "16", stem_direction: -1 })
  ];
  for(var i=0; i<16; i++){
    notesBar1[i].addArticulation(0, new Vex.Flow.Articulation("a.").setPosition(4));
    notesBar1[i].addArticulation(0, new Vex.Flow.Articulation("a>").setPosition(4));
    
    if(i === 15)
      notesBar1[i].addArticulation(0, new Vex.Flow.Articulation("a@u").setPosition(4));
  }

  var beam1 = new Vex.Flow.Beam(notesBar1.slice(0,8));
  var beam2 = new Vex.Flow.Beam(notesBar1.slice(8,16));
  
  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  // bar 2 - juxtaposing second bar next to first bar
  var staveBar2 = new Vex.Flow.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 250);
  staveBar2.setContext(ctx).draw();
  var notesBar2 = [
    new Vex.Flow.StaveNote({ keys: ["f/3"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["g/3"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["a/3"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["b/3"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["e/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "16", stem_direction: 1 }),
    new Vex.Flow.StaveNote({ keys: ["g/4"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/4"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["d/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["e/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/5"], duration: "16", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["g/5"], duration: "16", stem_direction: -1 })
  ];
  for(i=0; i<16; i++){
    notesBar2[i].addArticulation(0, new Vex.Flow.Articulation("a-").setPosition(3));
    notesBar2[i].addArticulation(0, new Vex.Flow.Articulation("a^").setPosition(3));
    
    if(i === 15)
      notesBar2[i].addArticulation(0, new Vex.Flow.Articulation("a@u").setPosition(4));
  }

  var beam3 = new Vex.Flow.Beam(notesBar2.slice(0,8));
  var beam4 = new Vex.Flow.Beam(notesBar2.slice(8,16));
  
  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
  beam3.setContext(ctx).draw();
  beam4.setContext(ctx).draw();

  // bar 3 - juxtaposing second bar next to first bar
  var staveBar3 = new Vex.Flow.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 75);
  staveBar3.setContext(ctx).draw();

  var notesBar3 = [
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "w", stem_direction: 1 })
  ];
  notesBar3[0].addArticulation(0, new Vex.Flow.Articulation("a-").setPosition(3));
  notesBar3[0].addArticulation(0, new Vex.Flow.Articulation("a>").setPosition(3));
  notesBar3[0].addArticulation(0, new Vex.Flow.Articulation("a@a").setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
  // bar 4 - juxtaposing second bar next to first bar
  var staveBar4 = new Vex.Flow.Stave(staveBar3.width + staveBar3.x, staveBar3.y, 125);
  staveBar4.setEndBarType(Vex.Flow.Barline.type.END);
  staveBar4.setContext(ctx).draw();

  var notesBar4 = [
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["a/5"], duration: "q", stem_direction: -1 })
  ];
  for(i=0; i<4; i++){
    var position1 = 3;
    var position2 = 4;
    if(i > 1){
      position1 = 4;
      position2 = 3;
    }
    notesBar4[i].addArticulation(0, new Vex.Flow.Articulation("a-").setPosition(position1));
  }

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
}

Vex.Flow.Test.Articulation.tabNotes = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 600, 200);
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  var specs = [
    { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "8"},
    { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
    { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"},
    { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"}
  ];

  var notes = specs.map(function(noteSpec) {
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    return tabNote;
  });

  var notes2 = specs.map(function(noteSpec){
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    tabNote.setStemDirection(-1);
    return tabNote;
  });

  var notes3 = specs.map(function(noteSpec){
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    return tabNote;
  });

  notes[0].addModifier(new Vex.Flow.Articulation("a>").setPosition(3), 0); // U
  notes[1].addModifier(new Vex.Flow.Articulation("a>").setPosition(4), 0); // D
  notes[2].addModifier(new Vex.Flow.Articulation("a.").setPosition(3), 0); // U
  notes[3].addModifier(new Vex.Flow.Articulation("a.").setPosition(4), 0); // D

  notes2[0].addModifier(new Vex.Flow.Articulation("a>").setPosition(3), 0);
  notes2[1].addModifier(new Vex.Flow.Articulation("a>").setPosition(4), 0);
  notes2[2].addModifier(new Vex.Flow.Articulation("a.").setPosition(3), 0);
  notes2[3].addModifier(new Vex.Flow.Articulation("a.").setPosition(4), 0);

  notes3[0].addModifier(new Vex.Flow.Articulation("a>").setPosition(3), 0);
  notes3[1].addModifier(new Vex.Flow.Articulation("a>").setPosition(4), 0);
  notes3[2].addModifier(new Vex.Flow.Articulation("a.").setPosition(3), 0);
  notes3[3].addModifier(new Vex.Flow.Articulation("a.").setPosition(4), 0);

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setMode(Vex.Flow.Voice.Mode.SOFT);

  voice.addTickables(notes);
  voice.addTickables(notes2);
  voice.addTickables(notes3);


  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);


  voice.draw(ctx, stave);

  ok (true, 'TabNotes successfully drawn');

};
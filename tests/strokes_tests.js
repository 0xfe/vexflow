/**
 * VexFlow - Basic Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

Vex.Flow.Test.Strokes = {};

Vex.Flow.Test.Strokes.Start = function() {
  module("Strokes");
  Vex.Flow.Test.runTests("Strokes - Brush/Arpeggiate/Rasquedo",
      Vex.Flow.Test.Strokes.drawMultipleMeasures);
  
  Vex.Flow.Test.runTests("Strokes - Multi Voice",
      Vex.Flow.Test.Strokes.multi);
  
  Vex.Flow.Test.runTests("Strokes - Notation and Tab",
      Vex.Flow.Test.Strokes.notesWithTab);
  Vex.Flow.Test.runTests("Strokes - Multi-Voice Notation and Tab",
      Vex.Flow.Test.Strokes.multiNotationAndTab);
};

Vex.Flow.Test.Strokes.drawMultipleMeasures = function(options, contextBuilder) {
  // Get the rendering context

  var ctx = contextBuilder(options.canvas_sel, 600, 200);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  // bar 1
  var staveBar1 = new Vex.Flow.Stave(10, 50, 250);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.setContext(ctx);
  staveBar1.draw();

  var notesBar1 = [
    new Vex.Flow.StaveNote({ keys: ["a/3", "e/4", "a/4"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
  ];
  notesBar1[0].addStroke(0, new Vex.Flow.Stroke(1));
  notesBar1[1].addStroke(0, new Vex.Flow.Stroke(2));
  notesBar1[2].addStroke(0, new Vex.Flow.Stroke(1));
  notesBar1[3].addStroke(0, new Vex.Flow.Stroke(2));
  notesBar1[1].addAccidental(1, new Vex.Flow.Accidental("#"));
  notesBar1[1].addAccidental(2, new Vex.Flow.Accidental("#"));
  notesBar1[1].addAccidental(0, new Vex.Flow.Accidental("#"));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2
  var staveBar2 = new Vex.Flow.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
  staveBar2.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar2.setContext(ctx);
  staveBar2.draw();
  var notesBar2 = [
    new Vex.Flow.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
  ];
  notesBar2[0].addStroke(0, new Vex.Flow.Stroke(3));
  notesBar2[1].addStroke(0, new Vex.Flow.Stroke(4));
  notesBar2[2].addStroke(0, new Vex.Flow.Stroke(5));
  notesBar2[3].addStroke(0, new Vex.Flow.Stroke(6));
  notesBar2[3].addAccidental(0, new Vex.Flow.Accidental("bb"));
  notesBar2[3].addAccidental(1, new Vex.Flow.Accidental("bb"));
  notesBar2[3].addAccidental(2, new Vex.Flow.Accidental("bb"));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

  ok(true, "Brush/Roll/Rasquedo");

};

Vex.Flow.Test.Strokes.multi = function(options, contextBuilder) {
  var c = new contextBuilder(options.canvas_sel, 400, 200);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }
  var stave = new Vex.Flow.Stave(50, 10, 300);
  stave.setContext(c);
  stave.draw();

  var notes = [
    newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
    newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
    newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
    newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
  ];
  // Create the strokes
  var stroke1 = new Vex.Flow.Stroke(5);
  var stroke2 = new Vex.Flow.Stroke(6);
  var stroke3 = new Vex.Flow.Stroke(2);
  var stroke4 = new Vex.Flow.Stroke(1);
  notes[0].addStroke(0, stroke1);
  notes[1].addStroke(0, stroke2);
  notes[2].addStroke(0, stroke3);
  notes[3].addStroke(0, stroke4);
  notes[1].addAccidental(0, new Vex.Flow.Accidental("#"));
  notes[1].addAccidental(2, new Vex.Flow.Accidental("#"));

  var notes2 = [
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);
  voice2.addTickables(notes2);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice, voice2]).
    format([voice, voice2], 275);

  var beam2_1 = new Vex.Flow.Beam(notes2.slice(0, 4));
  var beam2_2 = new Vex.Flow.Beam(notes2.slice(4, 8));

  voice2.draw(c, stave);
  beam2_1.setContext(c).draw();
  beam2_2.setContext(c).draw();
  voice.draw(c, stave);

  ok(true, "Strokes Test Multi Voice");
};

Vex.Flow.Test.Strokes.multiNotationAndTab = function(options, contextBuilder) {
  var c = new contextBuilder(options.canvas_sel, 400, 275);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newTabNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }
  var stave = new Vex.Flow.Stave(10, 10, 400).addTrebleGlyph().
    setContext(c).draw();
  var tabstave = new Vex.Flow.TabStave(10, 125, 400).addTabGlyph().
    setNoteStartX(stave.getNoteStartX()).setContext(c).draw();

  // notation upper voice notes
  var notes = [
    newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
    newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
    newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" }),
    newNote({ keys: ["g/4", "b/4", "e/5"], duration: "q" })
  ];

  // tablature upper voice notes
  var notes3 = [
    newTabNote({ positions: [{str: 3, fret: 0},
                             {str: 2, fret: 0},
                             {str: 1, fret: 1}], duration: "q"}),
    newTabNote({ positions: [{str: 3, fret: 0},
                             {str: 2, fret: 0},
                             {str: 1, fret: 1}], duration: "q"}),
    newTabNote({ positions: [{str: 3, fret: 0},
                             {str: 2, fret: 0},
                             {str: 1, fret: 1}], duration: "q"}),
    newTabNote({ positions: [{str: 3, fret: 0},
                             {str: 2, fret: 0},
                             {str: 1, fret: 1}], duration: "q"})
  ];

  // Create the strokes for notation
  var stroke1 = new Vex.Flow.Stroke(3, {all_voices: false});
  var stroke2 = new Vex.Flow.Stroke(6);
  var stroke3 = new Vex.Flow.Stroke(2, {all_voices: false});
  var stroke4 = new Vex.Flow.Stroke(1);
  // add strokes to notation
  notes[0].addStroke(0, stroke1);
  notes[1].addStroke(0, stroke2);
  notes[2].addStroke(0, stroke3);
  notes[3].addStroke(0, stroke4);

  // creae strokes for tab
  var stroke5 = new Vex.Flow.Stroke(3, {all_voices: false});
  var stroke6 = new Vex.Flow.Stroke(6);
  var stroke7 = new Vex.Flow.Stroke(2, {all_voices: false});
  var stroke8 = new Vex.Flow.Stroke(1);
  // add strokes to tab
  notes3[0].addStroke(0, stroke5);
  notes3[1].addStroke(0, stroke6);
  notes3[2].addStroke(0, stroke7);
  notes3[3].addStroke(0, stroke8);

  // notation lower voice notes
  var notes2 = [
    newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["g/3"], stem_direction: -1, duration: "q"})
  ];

  // tablature lower voice notes
  var notes4 = [
    newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
    newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
    newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"}),
    newTabNote({ positions: [{str: 6, fret: 3}], duration: "q"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice3 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice4 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);
  voice2.addTickables(notes2);
  voice4.addTickables(notes4);
  voice3.addTickables(notes3);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice, voice2, voice3, voice4]).
    format([voice, voice2, voice3, voice4], 275);

  voice2.draw(c, stave);
  voice.draw(c, stave);
  voice4.draw(c, tabstave);
  voice3.draw(c, tabstave);

  ok(true, "Strokes Test Notation & Tab Multi Voice");
};

Vex.Flow.Test.Strokes.drawTabStrokes = function(options, contextBuilder) {
  // Get the rendering context
  var ctx = contextBuilder(options.canvas_sel, 600, 200);

  // bar 1
  var staveBar1 = new Vex.Flow.TabStave(10, 50, 250);
  staveBar1.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar1.setContext(ctx).draw();

  var notesBar1 = [
    new Vex.Flow.TabNote({ positions: [{str: 2, fret: 8 },
                                       {str: 3, fret: 9},
                                       {str: 4, fret: 10}], duration: "q"}),
    new Vex.Flow.TabNote({ positions: [{str: 3, fret: 7 },
                                       {str: 4, fret: 8},
                                       {str: 5, fret: 9}], duration: "q"}),
    new Vex.Flow.TabNote({ positions: [{str: 1, fret: 5 },
                                       {str: 2, fret: 6},
                                       {str: 3, fret: 7},
                                       {str: 4, fret: 7},
                                       {str: 5, fret: 5},
                                       {str: 6, fret: 5}], duration: "q"}),
    new Vex.Flow.TabNote({ positions: [{str: 4, fret: 3 },
                                       {str: 5, fret: 4},
                                       {str: 6, fret: 5}], duration: "q"}),
  ];

  var stroke1 = new Vex.Flow.Stroke(1);
  var stroke2 = new Vex.Flow.Stroke(2);
  var stroke3 = new Vex.Flow.Stroke(3);
  var stroke4 = new Vex.Flow.Stroke(4);

  notesBar1[0].addStroke(0, stroke1);
  notesBar1[1].addStroke(0, stroke2);
  notesBar1[2].addStroke(0, stroke4);
  notesBar1[3].addStroke(0, stroke3);

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

 // bar 2
  var staveBar2 = new Vex.Flow.TabStave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
  staveBar2.setEndBarType(Vex.Flow.Barline.type.DOUBLE);
  staveBar2.setContext(ctx).draw();
  var notesBar2 = [new Vex.Flow.TabNote({ positions: [{str: 2, fret: 7 },
                                                      {str: 3, fret: 8},
                                                      {str: 4, fret: 9}], duration: "h"}),
                   new Vex.Flow.TabNote({ positions: [{str: 1, fret: 5 },
                                                      {str: 2, fret: 6},
                                                      {str: 3, fret: 7},
                                                      {str: 4, fret: 7},
                                                      {str: 5, fret: 5},
                                                      {str: 6, fret: 5}], duration: "h"}),
  ];

  notesBar2[0].addStroke(0, new Vex.Flow.Stroke(6));
  notesBar2[1].addStroke(0, new Vex.Flow.Stroke(5));

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
  ok(true, "Strokes Tab test");

};

Vex.Flow.Test.Strokes.getTabNotes = function() {
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newTabNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes1 = [
    newNote({ keys: ["g/5", "d/5", "b/4"], stem_direction: -1, duration: "q"}).
      addAccidental(1, newAcc("b")).
      addAccidental(0, newAcc("b")),
    newNote({ keys: ["c/5", "d/5"], stem_direction: -1, duration: "q"}),
    newNote({ keys: ["b/3", "e/4", "a/4", "d/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/3", "e/4", "a/4", "c/5", "e/5", "a/5"], stem_direction: 1, duration: "8"}).
      addAccidental(3, newAcc("#")),
    newNote({ keys: ["b/3", "e/4", "a/4", "d/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/3", "e/4", "a/4", "c/5", "f/5", "a/5"], stem_direction: 1, duration: "8"}).
        addAccidental(3, newAcc("#")).
        addAccidental(4, newAcc("#"))
  ];

  var tabs1 = [
    newTabNote({ positions: [{str: 1, fret: 3},
                             {str: 2, fret: 2},
                             {str: 3, fret: 3}], duration: "q"}).
      addModifier(new Vex.Flow.Bend("Full"), 0),
    newTabNote({ positions: [{str: 2, fret: 3},
                             {str: 3, fret: 5}], duration: "q"}).
      addModifier(new Vex.Flow.Bend("Unison"), 1),
    newTabNote({ positions: [{str: 3, fret: 7},
                             {str: 4, fret: 7},
                             {str: 5, fret: 7},
                             {str: 6, fret: 7},], duration: "8"}),
    newTabNote({ positions: [{str: 1, fret: 5},
                             {str: 2, fret: 5},
                             {str: 3, fret: 6},
                             {str: 4, fret: 7},
                             {str: 5, fret: 7},
                             {str: 6, fret: 5}], duration: "8"}),
    newTabNote({ positions: [{str: 3, fret: 7},
                             {str: 4, fret: 7},
                             {str: 5, fret: 7},
                             {str: 6, fret: 7},], duration: "8"}),
    newTabNote({ positions: [{str: 1, fret: 5},
                             {str: 2, fret: 5},
                             {str: 3, fret: 6},
                             {str: 4, fret: 7},
                             {str: 5, fret: 7},
                             {str: 6, fret: 5}], duration: "8"})

  ];

  var noteStr1 = new Vex.Flow.Stroke(1);
  var noteStr2 = new Vex.Flow.Stroke(2);
  var noteStr3 = new Vex.Flow.Stroke(3);
  var noteStr4 = new Vex.Flow.Stroke(4);
  var noteStr5 = new Vex.Flow.Stroke(5);
  var noteStr6 = new Vex.Flow.Stroke(6);

  notes1[0].addStroke(0, noteStr1);
  notes1[1].addStroke(0, noteStr2);
  notes1[2].addStroke(0, noteStr3);
  notes1[3].addStroke(0, noteStr4);
  notes1[4].addStroke(0, noteStr5);
  notes1[5].addStroke(0, noteStr6);

  var tabStr1 = new Vex.Flow.Stroke(1);
  var tabStr2 = new Vex.Flow.Stroke(2);
  var tabStr3 = new Vex.Flow.Stroke(3);
  var tabStr4 = new Vex.Flow.Stroke(4);
  var tabStr5 = new Vex.Flow.Stroke(5);
  var tabStr6 = new Vex.Flow.Stroke(6);

  tabs1[0].addStroke(0, tabStr1);
  tabs1[1].addStroke(0, tabStr2);
  tabs1[2].addStroke(0, tabStr3);
  tabs1[3].addStroke(0, tabStr4);
  tabs1[4].addStroke(0, tabStr5);
  tabs1[5].addStroke(0, tabStr6);

  return { notes: notes1, tabs: tabs1 };
};

Vex.Flow.Test.Strokes.renderNotesWithTab =
  function(notes, ctx, staves, justify) {
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var tabVoice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);

  voice.addTickables(notes.notes);
  // Takes a voice and returns it's auto beamsj
  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);

  tabVoice.addTickables(notes.tabs);

  new Vex.Flow.Formatter().
    joinVoices([voice]).joinVoices([tabVoice]).
    format([voice, tabVoice], justify);

  voice.draw(ctx, staves.notes);
  beams.forEach(function(beam){
    beam.setContext(ctx).draw();
  });
  tabVoice.draw(ctx, staves.tabs);
}

Vex.Flow.Test.Strokes.notesWithTab = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 420, 450);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "10pt Arial";

  // Get test voices.
  var notes = Vex.Flow.Test.Strokes.getTabNotes();
  var stave = new Vex.Flow.Stave(10, 10, 400).addTrebleGlyph().
    setContext(ctx).draw();
  var tabstave = new Vex.Flow.TabStave(10, 100, 400).addTabGlyph().
    setNoteStartX(stave.getNoteStartX()).setContext(ctx).draw();
  var connector = new Vex.Flow.StaveConnector(stave, tabstave);
  var line = new Vex.Flow.StaveConnector(stave, tabstave);
  connector.setType(Vex.Flow.StaveConnector.type.BRACKET);
  connector.setContext(ctx);
  line.setType(Vex.Flow.StaveConnector.type.SINGLE);
  connector.setContext(ctx);
  line.setContext(ctx);
  connector.draw();
  line.draw();

  Vex.Flow.Test.Strokes.renderNotesWithTab(notes, ctx,
      { notes: stave, tabs: tabstave });
  ok(true);

  var stave2 = new Vex.Flow.Stave(10, 250, 400).addTrebleGlyph().
    setContext(ctx).draw();
  var tabstave2 = new Vex.Flow.TabStave(10, 350, 400).addTabGlyph().
    setNoteStartX(stave2.getNoteStartX()).setContext(ctx).draw();
  var connector = new Vex.Flow.StaveConnector(stave2, tabstave2);
  var line = new Vex.Flow.StaveConnector(stave2, tabstave2);
  connector.setType(Vex.Flow.StaveConnector.type.BRACKET);
  connector.setContext(ctx);
  line.setType(Vex.Flow.StaveConnector.type.SINGLE);
  connector.setContext(ctx);
  line.setContext(ctx);
  connector.draw();
  line.draw();

  Vex.Flow.Test.Strokes.renderNotesWithTab(notes, ctx,
      { notes: stave2, tabs: tabstave2 }, 385);
  ok(true);
}

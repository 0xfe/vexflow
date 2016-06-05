/**
 * VexFlow - Stroke Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Strokes = (function() {
  var Strokes = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("Strokes");
      runTests("Strokes - Brush/Arpeggiate/Rasquedo", Strokes.drawMultipleMeasures);
      runTests("Strokes - Multi Voice", Strokes.multi);
      runTests("Strokes - Notation and Tab", Strokes.notesWithTab);
      runTests("Strokes - Multi-Voice Notation and Tab", Strokes.multiNotationAndTab);
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      // Get the rendering context

      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 250);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setContext(ctx);
      staveBar1.draw();

      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/3", "e/4", "a/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];
      notesBar1[0].addStroke(0, new VF.Stroke(1));
      notesBar1[1].addStroke(0, new VF.Stroke(2));
      notesBar1[2].addStroke(0, new VF.Stroke(1));
      notesBar1[3].addStroke(0, new VF.Stroke(2));
      notesBar1[1].addAccidental(1, new VF.Accidental("#"));
      notesBar1[1].addAccidental(2, new VF.Accidental("#"));
      notesBar1[1].addAccidental(0, new VF.Accidental("#"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx);
      staveBar2.draw();
      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "g/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      notesBar2[0].addStroke(0, new VF.Stroke(3));
      notesBar2[1].addStroke(0, new VF.Stroke(4));
      notesBar2[2].addStroke(0, new VF.Stroke(5));
      notesBar2[3].addStroke(0, new VF.Stroke(6));
      notesBar2[3].addAccidental(0, new VF.Accidental("bb"));
      notesBar2[3].addAccidental(1, new VF.Accidental("bb"));
      notesBar2[3].addAccidental(2, new VF.Accidental("bb"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      ok(true, "Brush/Roll/Rasquedo");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 400, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      var stave = new VF.Stave(50, 10, 300);
      stave.setContext(c);
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      // Create the strokes
      var stroke1 = new VF.Stroke(5);
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2);
      var stroke4 = new VF.Stroke(1);
      notes[0].addStroke(0, stroke1);
      notes[1].addStroke(0, stroke2);
      notes[2].addStroke(0, stroke3);
      notes[3].addStroke(0, stroke4);
      notes[1].addAccidental(0, new VF.Accidental("#"));
      notes[1].addAccidental(2, new VF.Accidental("#"));

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

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 275);

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    },

    multiNotationAndTab: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 400, 275);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(c).draw();
      var tabstave = new VF.TabStave(10, 125, 400).addTabGlyph().
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
      var stroke1 = new VF.Stroke(3, {all_voices: false});
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2, {all_voices: false});
      var stroke4 = new VF.Stroke(1);
      // add strokes to notation
      notes[0].addStroke(0, stroke1);
      notes[1].addStroke(0, stroke2);
      notes[2].addStroke(0, stroke3);
      notes[3].addStroke(0, stroke4);

      // creae strokes for tab
      var stroke5 = new VF.Stroke(3, {all_voices: false});
      var stroke6 = new VF.Stroke(6);
      var stroke7 = new VF.Stroke(2, {all_voices: false});
      var stroke8 = new VF.Stroke(1);
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

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      var voice3 = new VF.Voice(VF.Test.TIME4_4);
      var voice4 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);
      voice4.addTickables(notes4);
      voice3.addTickables(notes3);

      var formatter = new VF.Formatter().joinVoices([voice, voice2, voice3, voice4]).
        format([voice, voice2, voice3, voice4], 275);

      voice2.draw(c, stave);
      voice.draw(c, stave);
      voice4.draw(c, tabstave);
      voice3.draw(c, tabstave);

      ok(true, "Strokes Test Notation & Tab Multi Voice");
    },

    drawTabStrokes: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 600, 200);

      // bar 1
      var staveBar1 = new VF.TabStave(10, 50, 250);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setContext(ctx).draw();

      var notesBar1 = [
        new VF.TabNote({ positions: [{str: 2, fret: 8 },
                                           {str: 3, fret: 9},
                                           {str: 4, fret: 10}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 3, fret: 7 },
                                           {str: 4, fret: 8},
                                           {str: 5, fret: 9}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 1, fret: 5 },
                                           {str: 2, fret: 6},
                                           {str: 3, fret: 7},
                                           {str: 4, fret: 7},
                                           {str: 5, fret: 5},
                                           {str: 6, fret: 5}], duration: "q"}),
        new VF.TabNote({ positions: [{str: 4, fret: 3 },
                                           {str: 5, fret: 4},
                                           {str: 6, fret: 5}], duration: "q"}),
      ];

      var stroke1 = new VF.Stroke(1);
      var stroke2 = new VF.Stroke(2);
      var stroke3 = new VF.Stroke(3);
      var stroke4 = new VF.Stroke(4);

      notesBar1[0].addStroke(0, stroke1);
      notesBar1[1].addStroke(0, stroke2);
      notesBar1[2].addStroke(0, stroke4);
      notesBar1[3].addStroke(0, stroke3);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

     // bar 2
      var staveBar2 = new VF.TabStave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();
      var notesBar2 = [new VF.TabNote({ positions: [{str: 2, fret: 7 },
                                                          {str: 3, fret: 8},
                                                          {str: 4, fret: 9}], duration: "h"}),
                       new VF.TabNote({ positions: [{str: 1, fret: 5 },
                                                          {str: 2, fret: 6},
                                                          {str: 3, fret: 7},
                                                          {str: 4, fret: 7},
                                                          {str: 5, fret: 5},
                                                          {str: 6, fret: 5}], duration: "h"}),
      ];

      notesBar2[0].addStroke(0, new VF.Stroke(6));
      notesBar2[1].addStroke(0, new VF.Stroke(5));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
      ok(true, "Strokes Tab test");

    },

    getTabNotes: function() {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newTabNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes1 = [
        newNote({ keys: ["b/4", "d/5", "g/5"], stem_direction: -1, duration: "q"}).
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
          addModifier(new VF.Bend("Full"), 0),
        newTabNote({ positions: [{str: 2, fret: 3},
                                 {str: 3, fret: 5}], duration: "q"}).
          addModifier(new VF.Bend("Unison"), 1),
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

      var noteStr1 = new VF.Stroke(1);
      var noteStr2 = new VF.Stroke(2);
      var noteStr3 = new VF.Stroke(3);
      var noteStr4 = new VF.Stroke(4);
      var noteStr5 = new VF.Stroke(5);
      var noteStr6 = new VF.Stroke(6);

      notes1[0].addStroke(0, noteStr1);
      notes1[1].addStroke(0, noteStr2);
      notes1[2].addStroke(0, noteStr3);
      notes1[3].addStroke(0, noteStr4);
      notes1[4].addStroke(0, noteStr5);
      notes1[5].addStroke(0, noteStr6);

      var tabStr1 = new VF.Stroke(1);
      var tabStr2 = new VF.Stroke(2);
      var tabStr3 = new VF.Stroke(3);
      var tabStr4 = new VF.Stroke(4);
      var tabStr5 = new VF.Stroke(5);
      var tabStr6 = new VF.Stroke(6);

      tabs1[0].addStroke(0, tabStr1);
      tabs1[1].addStroke(0, tabStr2);
      tabs1[2].addStroke(0, tabStr3);
      tabs1[3].addStroke(0, tabStr4);
      tabs1[4].addStroke(0, tabStr5);
      tabs1[5].addStroke(0, tabStr6);

      return { notes: notes1, tabs: tabs1 };
    },

    renderNotesWithTab:
      function(notes, ctx, staves, justify) {
      var voice = new VF.Voice(VF.Test.TIME4_4);
      var tabVoice = new VF.Voice(VF.Test.TIME4_4);

      voice.addTickables(notes.notes);
      // Takes a voice and returns it's auto beamsj
      var beams = VF.Beam.applyAndGetBeams(voice);

      tabVoice.addTickables(notes.tabs);

      new VF.Formatter().
        joinVoices([voice]).joinVoices([tabVoice]).
        format([voice, tabVoice], justify);

      voice.draw(ctx, staves.notes);
      beams.forEach(function(beam){
        beam.setContext(ctx).draw();
      });
      tabVoice.draw(ctx, staves.tabs);
    },

    notesWithTab: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 420, 450);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = "10pt Arial";

      // Get test voices.
      var notes = VF.Test.Strokes.getTabNotes();
      var stave = new VF.Stave(10, 10, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave = new VF.TabStave(10, 100, 400).addTabGlyph().
        setNoteStartX(stave.getNoteStartX()).setContext(ctx).draw();
      var connector = new VF.StaveConnector(stave, tabstave);
      var line = new VF.StaveConnector(stave, tabstave);
      connector.setType(VF.StaveConnector.type.BRACKET);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      connector.draw();
      line.draw();

      VF.Test.Strokes.renderNotesWithTab(notes, ctx,
          { notes: stave, tabs: tabstave });
      ok(true);

      var stave2 = new VF.Stave(10, 250, 400).addTrebleGlyph().
        setContext(ctx).draw();
      var tabstave2 = new VF.TabStave(10, 350, 400).addTabGlyph().
        setNoteStartX(stave2.getNoteStartX()).setContext(ctx).draw();
      var connector = new VF.StaveConnector(stave2, tabstave2);
      var line = new VF.StaveConnector(stave2, tabstave2);
      connector.setType(VF.StaveConnector.type.BRACKET);
      connector.setContext(ctx);
      line.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx);
      line.setContext(ctx);
      connector.draw();
      line.draw();

      VF.Test.Strokes.renderNotesWithTab(notes, ctx,
          { notes: stave2, tabs: tabstave2 }, 385);
      ok(true);
    }
  };

  return Strokes;
})();
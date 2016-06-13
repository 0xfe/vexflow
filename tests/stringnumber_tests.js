/**
 * VexFlow - StringNumber Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.StringNumber = (function() {
  var StringNumber = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("StringNumber");
      runTests("String Number In Notation", StringNumber.drawMultipleMeasures);
      runTests("Fret Hand Finger In Notation", StringNumber.drawFretHandFingers);
      runTests("Multi Voice With Strokes, String & Finger Numbers", StringNumber.multi);
      runTests("Complex Measure With String & Finger Numbers", StringNumber.drawAccidentals);
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 200);
      function newStringNumber(num, pos) {
        return new VF.StringNumber(num).setPosition(pos);
      }

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 290);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: -1, duration: "q" }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: -1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

       notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addAccidental(1, new VF.Accidental("#").setAsCautionary()).
        addModifier(2, newStringNumber("3",VF.Modifier.Position.ABOVE).
                                           setLastNote(notesBar1[3]).
                                           setLineEndType(VF.Renderer.LineEndType.DOWN));

      notesBar1[2].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar1[3].
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        // Position string 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
          // Position string 3 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "q" }),
      ];

      notesBar2[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

      notesBar2[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE).setLastNote(notesBar2[3]).setDashed(false));

      notesBar2[2].
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar2[3].
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        // Position string 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
        // Position string 5 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // bar 3 - juxtaposing third bar next to second bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x, staveBar2.y, 150);
      staveBar3.setEndBarType(VF.Barline.type.END);
      staveBar3.setContext(ctx).draw();

      var notesBar3 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "a/4"], duration: "w" }).addDotToAll(),
      ];

      notesBar3[0].
        addModifier(0, newStringNumber("5", VF.Modifier.Position.BELOW)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT)).
        addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT)).
        addModifier(3, newStringNumber("2", VF.Modifier.Position.ABOVE));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      ok(true, "String Number");
    },

    drawFretHandFingers: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 290);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

       notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

      notesBar1[2].
        addModifier(0, newFinger("3", VF.Modifier.Position.BELOW)).
        addModifier(1, newFinger("4", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
        addModifier(2, newFinger("0", VF.Modifier.Position.ABOVE)).
        addAccidental(1, new VF.Accidental("#"));

      notesBar1[3].
        addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
        // Position string 5 below default
        addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
        addModifier(1, newFinger("4", VF.Modifier.Position.RIGHT)).
        // Position String 4 below default
        addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
        // Position finger 0 above default
        addModifier(2, newFinger("0", VF.Modifier.Position.RIGHT).setOffsetY(-5)).
        // Position string 3 above default
        addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);


      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setEndBarType(VF.Barline.type.END);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], stem_direction: 1, duration: "q" }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5", "e/5", "g/5"], stem_direction: 1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: 1, duration: "8" }),
        new VF.StaveNote({ keys: ["c/4", "f/4", "g/4"], stem_direction: -1, duration: "q" }).addDotToAll(),
      ];

     notesBar2[0].
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT)).
      addModifier(2, newFinger("0", VF.Modifier.Position.ABOVE));

     notesBar2[1].
      addAccidental(0, new VF.Accidental("#")).
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addAccidental(1, new VF.Accidental("#")).
      addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));

    notesBar2[2].
      addModifier(0, newFinger("3", VF.Modifier.Position.BELOW)).
      addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
      addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT)).
    //  addModifier(2, newFinger("1", VF.Modifier.Position.ABOVE)).
      addModifier(2, newFinger("1", VF.Modifier.Position.RIGHT)).
      addAccidental(2, new VF.Accidental("#"));

    notesBar2[3].
      addModifier(0, newFinger("3", VF.Modifier.Position.RIGHT)).
      // position string 5 below default
      addModifier(0, newStringNumber("5", VF.Modifier.Position.RIGHT).setOffsetY(7)).
      // position finger 4 below default
      addModifier(1, newFinger("4", VF.Modifier.Position.RIGHT)).
      // position string 4 below default
      addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT).setOffsetY(6)).
      // position finger 1 above default
      addModifier(2, newFinger("1", VF.Modifier.Position.RIGHT).setOffsetY(-6)).
      // position string 3 above default
      addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT).setOffsetY(-6));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      ok(true, "String Number");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}
      var stave = new VF.Stave(50, 10, 500);
      stave.setContext(c);
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["a/3", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" })
      ];
      // Create the strokes
      var stroke1 = new VF.Stroke(5);
      var stroke2 = new VF.Stroke(6);
      var stroke3 = new VF.Stroke(2);
      var stroke4 = new VF.Stroke(1);
      notes[0].addStroke(0, stroke1);
      notes[0].addModifier(0, newFinger("3", VF.Modifier.Position.LEFT));
      notes[0].addModifier(1, newFinger("2", VF.Modifier.Position.LEFT));
      notes[0].addModifier(2, newFinger("0", VF.Modifier.Position.LEFT));
      notes[0].addModifier(1, newStringNumber("4", VF.Modifier.Position.LEFT));
      notes[0].addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE));

      notes[1].addStroke(0, stroke2);
      notes[1].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));
      notes[1].addModifier(2, newStringNumber("3", VF.Modifier.Position.ABOVE));
      notes[1].addAccidental(0, new VF.Accidental("#"));
      notes[1].addAccidental(1, new VF.Accidental("#"));
      notes[1].addAccidental(2, new VF.Accidental("#"));

      notes[2].addStroke(0, stroke3);
      notes[2].addModifier(0, newFinger("3", VF.Modifier.Position.LEFT));
      notes[2].addModifier(1, newFinger("0", VF.Modifier.Position.RIGHT));
      notes[2].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));
      notes[2].addModifier(2, newFinger("1", VF.Modifier.Position.LEFT));
      notes[2].addModifier(2, newStringNumber("3", VF.Modifier.Position.RIGHT));

      notes[3].addStroke(0, stroke4);
      notes[3].addModifier(2, newStringNumber("3", VF.Modifier.Position.LEFT));
      notes[3].addModifier(1, newStringNumber("4", VF.Modifier.Position.RIGHT));

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
      notes2[0].addModifier(0, newFinger("0", VF.Modifier.Position.LEFT));
      notes2[0].addModifier(0, newStringNumber("6", VF.Modifier.Position.BELOW));
      notes2[2].addAccidental(0, new VF.Accidental("#"));
      notes2[4].addModifier(0, newFinger("0", VF.Modifier.Position.LEFT));
      // Position string number 6 beneath the strum arrow: left (15) and down (18)
      notes2[4].addModifier(0, newStringNumber("6", VF.Modifier.Position.LEFT).
                                   setOffsetX(15).
                                   setOffsetY(18));

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      var formatter = new VF.Formatter().joinVoices([voice, voice2]).
        format([voice, voice2], 400);

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    },

    drawAccidentals: function(options, contextBuilder) {
      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 600, 200);
      function newFinger(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) { return new VF.StringNumber(num).setPosition(pos);}

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 475);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.addClef("treble").setContext(ctx).draw();
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "c/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: 1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4", "d/5", "e/5", "g/5"], stem_direction: -1, duration: "q" }),
      ];

      notesBar1[0].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(0, new VF.Accidental("#")).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(2, new VF.Accidental("#")).
        addModifier(3, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(3, new VF.Accidental("#")).
        addModifier(4, newFinger("2", VF.Modifier.Position.RIGHT)).
        addModifier(4, newStringNumber("3", VF.Modifier.Position.RIGHT)).
        addAccidental(4, new VF.Accidental("#")).
        addModifier(5, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[1].
        addAccidental(0, new VF.Accidental("#")).
        addAccidental(1, new VF.Accidental("#")).
        addAccidental(2, new VF.Accidental("#")).
        addAccidental(3, new VF.Accidental("#")).
        addAccidental(4, new VF.Accidental("#")).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[2].
        addModifier(0, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(0, new VF.Accidental("#")).
        addModifier(1, newFinger("2", VF.Modifier.Position.LEFT)).
        addModifier(1, newStringNumber("2", VF.Modifier.Position.LEFT)).
        addAccidental(1, new VF.Accidental("#")).
        addModifier(2, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(2, new VF.Accidental("#")).
        addModifier(3, newFinger("3", VF.Modifier.Position.LEFT)).
        addAccidental(3, new VF.Accidental("#")).
        addModifier(4, newFinger("2", VF.Modifier.Position.RIGHT)).
        addModifier(4, newStringNumber("3", VF.Modifier.Position.RIGHT)).
        addAccidental(4, new VF.Accidental("#")).
        addModifier(5, newFinger("0", VF.Modifier.Position.LEFT)).
        addAccidental(5, new VF.Accidental("#"));

      notesBar1[3].
        addAccidental(0, new VF.Accidental("#")).
        addAccidental(1, new VF.Accidental("#")).
        addAccidental(2, new VF.Accidental("#")).
        addAccidental(3, new VF.Accidental("#")).
        addAccidental(4, new VF.Accidental("#")).
        addAccidental(5, new VF.Accidental("#"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      ok(true, "String Number");
    }
  };

  return StringNumber;
})();
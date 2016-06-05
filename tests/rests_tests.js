/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

VF.Test.Rests = (function() {
  var Rests = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Rests");
      runTests("Rests - Dotted", Rests.basic);
      runTests("Auto Align Rests - Beamed Notes Stems Up", Rests.beamsUp);
      runTests("Auto Align Rests - Beamed Notes Stems Down", Rests.beamsDown);
      runTests("Auto Align Rests - Tuplets Stems Up", Rests.tuplets);
      runTests("Auto Align Rests - Tuplets Stems Down", Rests.tupletsdown);
      runTests("Auto Align Rests - Single Voice (Default)", Rests.staveRests);
      runTests("Auto Align Rests - Single Voice (Align All)", Rests.staveRestsAll);
      runTests("Auto Align Rests - Multi Voice", Rests.multi);
    },

    setupContext: function(options, contextBuilder, x, y) {
      var ctx = new contextBuilder(options.canvas_sel, x || 350, y || 150);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, x || 350).addTrebleGlyph().
        setContext(ctx).draw();

      return {context: ctx, stave: stave};
    },

    basic: function(options, contextBuilder) {
      var c = VF.Test.Rests.setupContext(options, contextBuilder, 700);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "wr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "hr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "16r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "32r"}).addDotToAll(),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "64r"}).addDotToAll()
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);

      voice.setStrict(false);
      voice.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice.draw(c.context, c.stave);

      ok(true, "Dotted Rest Test");
    },

    beamsUp: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "8r"}),
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),

      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8,12));


      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Beams Up Test");
    },

    beamsDown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["c/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["b/4","d/5","a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

      ];

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8, 12));

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Beams Down Test");
    },

    tuplets: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
      ];

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9));
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12));
      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet3.setTupletLocation(VF.Tuplet.LOCATION_TOP);
      tuplet4.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Tuplets Stem Up Test");
    },

    tupletsdown: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
      ];

      var beam1 = new VF.Beam(notes.slice(0, 3));
      var beam2 = new VF.Beam(notes.slice(3, 6));
      var beam3 = new VF.Beam(notes.slice(6, 9));
      var beam4 = new VF.Beam(notes.slice(9, 12));

      var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
      var tuplet2 = new VF.Tuplet(notes.slice(3, 6));
      var tuplet3 = new VF.Tuplet(notes.slice(6, 9));
      var tuplet4 = new VF.Tuplet(notes.slice(9, 12));
      tuplet1.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet2.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet3.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
      tuplet4.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);

      tuplet1.setContext(c.context).draw();
      tuplet2.setContext(c.context).draw();
      tuplet3.setContext(c.context).draw();
      tuplet4.setContext(c.context).draw();

      beam1.setContext(c.context).draw();
      beam2.setContext(c.context).draw();
      beam3.setContext(c.context).draw();
      beam4.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Tuplets Stem Down Test");
    },

    staveRests: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12));
      tuplet.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      VF.Formatter.FormatAndDraw(c.context, c.stave, notes);

      voice1.draw(c.context, c.stave);
      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Default Test");
    },


    staveRestsAll: function(options, b) {
      var c = VF.Test.Rests.setupContext(options, b, 600, 160);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["f/4"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),

        newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/5"], stem_direction: -1, duration: "8"}),

        newNote({ keys: ["a/5"], stem_direction: 1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: 1, duration: "qr"}),
        newNote({ keys: ["b/5"], stem_direction: 1, duration: "q"}),

        newNote({ keys: ["d/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["g/5"], stem_direction: -1, duration: "q"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "qr"}),
      ];

      var beam1 = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12));
      tuplet.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice1 = new VF.Voice(VF.Test.TIME4_4);

      voice1.setStrict(false);
      voice1.addTickables(notes);
      c.stave.addTimeSignature("4/4");
      c.stave.draw(c.context);

      // Set option to position rests near the notes in the voice
      new VF.Formatter.FormatAndDraw(c.context, c.stave, notes, {align_rests: true});

      voice1.draw(c.context, c.stave);
      tuplet.setContext(c.context).draw();
      beam1.setContext(c.context).draw();

      ok(true, "Auto Align Rests - Align All Test");
    },

    multi: function(options, contextBuilder) {
      var c = new contextBuilder(options.canvas_sel, 600, 200);
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }
      function newFinger(num, pos) {
        return new VF.FretHandFinger(num).setPosition(pos); }
      function newStringNumber(num, pos) {
        return new VF.StringNumber(num).setPosition(pos);}
      var stave = new VF.Stave(50, 10, 500).addTrebleGlyph();
      stave.setContext(c);
      stave.addTimeSignature("4/4");
      stave.draw();

      var notes = [
        newNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        newNote({ keys: ["b/4"], duration: "qr" }),
        newNote({ keys: ["c/4", "d/4", "a/4"], duration: "q" }),
        newNote({ keys: ["b/4"], duration: "qr" })
      ];

      var notes2 = [
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["b/4"], stem_direction: -1, duration: "8r"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"}),
        newNote({ keys: ["e/3"], stem_direction: -1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      var voice2 = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);
      voice2.addTickables(notes2);

      // Set option to position rests near the notes in each voice
      var formatter = new VF.Formatter().
        joinVoices([voice, voice2]).
        format([voice, voice2], 400, {align_rests: true});

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      voice2.draw(c, stave);
      beam2_1.setContext(c).draw();
      beam2_2.setContext(c).draw();
      voice.draw(c, stave);

      ok(true, "Strokes Test Multi Voice");
    }
  };

  return Rests;
})();
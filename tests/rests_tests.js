/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 */

/*
eslint-disable
no-var,
no-undef,
quotes,
object-curly-spacing,
vars-on-top,
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
      ctx.scale(0.9, 0.9);
      ctx.fillStyle = "#221";
      ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, x || 350)
        .addTrebleGlyph()
        .setContext(ctx)
        .draw();

      return {context: ctx, stave: stave};
    },

    basic: function(options, contextBuilder) {
      var { stave, context } = VF.Test.Rests.setupContext(options, contextBuilder, 700);

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
      stave.addTimeSignature("4/4");
      stave.draw(context);

      // Instantiate a `Formatter` and format the notes.
      new VF.Formatter()
        .joinVoices([voice], { align_rests: true })
        .formatToStave([voice], stave, { align_rests: true, stave });

      voice.draw(context, stave);

      ok(true, "Dotted Rest Test");
    },

    beamsUp: function(options, b) {
      var { context, stave } = VF.Test.Rests.setupContext(options, b, 600, 160);

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

      var voice = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8,12));

      voice.setStrict(false);
      voice.addTickables(notes);
      stave.addTimeSignature("4/4");
      stave.draw(context);

      // Instantiate a `Formatter` and format the notes.
      new VF.Formatter()
        .joinVoices([voice], { align_rests: true })
        .formatToStave([voice], stave, { align_rests: true, stave });

      voice.draw(context);

      beam1.setContext(context).draw();
      beam2.setContext(context).draw();
      beam3.setContext(context).draw();

      ok(true, "Auto Align Rests - Beams Up Test");
    },

    beamsDown: function(options, b) {
      var { context, stave } = VF.Test.Rests.setupContext(options, b, 600, 160);

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

      var voice = new VF.Voice(VF.Test.TIME4_4);

      var beam1 = new VF.Beam(notes.slice(0, 4));
      var beam2 = new VF.Beam(notes.slice(4, 8));
      var beam3 = new VF.Beam(notes.slice(8, 12));

      voice.setStrict(false);
      voice.addTickables(notes);
      stave.addTimeSignature("4/4");

      // Instantiate a `Formatter` and format the notes.
      new VF.Formatter()
        .joinVoices([voice], { align_rests: true })
        .formatToStave([voice], stave, { align_rests: true, stave });

      stave.setContext(context).draw();
      voice.draw(context);
      beam1.setContext(context).draw();
      beam2.setContext(context).draw();
      beam3.setContext(context).draw();

      ok(true, "Auto Align Rests - Beams Down Test");
    },

    tuplets: function(options, b) {
      var { context, stave } = VF.Test.Rests.setupContext(options, b, 600, 160);

      stave.addTimeSignature("4/4");

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

      const tuplets = [[0, 3], [3, 6], [6, 9], [9, 12]]
        .map(range => new VF.Tuplet(notes.slice(...range)))
        .map(tuplet => tuplet.setTupletLocation(VF.Tuplet.LOCATION_TOP));

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setStrict(false)
        .addTickables(notes);

      // Instantiate a `Formatter` and format the notes.
      new VF.Formatter()
        .joinVoices([voice], { align_rests: true })
        .formatToStave([voice], stave, { align_rests: true, stave });

      stave.draw(context);
      voice.draw(context);
      tuplets.forEach(tuplet => tuplet.setContext(context).draw());

      ok(true, "Auto Align Rests - Tuplets Stem Up Test");
    },

    tupletsdown: function(options, b) {
      var { context, stave } = VF.Test.Rests.setupContext(options, b, 600, 160);

      stave.addTimeSignature("4/4");

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

      const noteGroups = [[0, 3], [3, 6], [6, 9], [9, 12]];

      const beams = noteGroups.map(range => new VF.Beam(notes.slice(...range)));
      const tuplets = noteGroups
        .map(range => new VF.Tuplet(notes.slice(...range)))
        .map(tuplet => tuplet.setTupletLocation(VF.Tuplet.LOCATION_BOTTOM));

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setStrict(false)
        .addTickables(notes);

      // Instantiate a `Formatter` and format the notes.
      new VF.Formatter()
        .joinVoices([voice], { align_rests: true })
        .formatToStave([voice], stave, { align_rests: true, stave });

      stave.setContext(context).draw();
      voice.draw(context);
      tuplets.forEach(tuplet => tuplet.setContext(context).draw());
      beams.forEach(beam => beam.setContext(context).draw());

      ok(true, "Auto Align Rests - Tuplets Stem Down Test");
    },

    staveRests: function(options, b) {
      var { context, stave } = VF.Test.Rests.setupContext(options, b, 600, 160);

      stave.addTimeSignature("4/4");

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

      var beam = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12));
      tuplet.setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setStrict(false)
        .addTickables(notes)
        .setStave(stave);

        // Instantiate a `Formatter` and format the notes.
      new VF.Formatter()
          .joinVoices([voice], { align_rests: true })
          .formatToStave([voice], stave, { align_rests: true, stave });

      stave.draw(context);
      voice.draw(context);
      tuplet.setContext(context).draw();
      beam.setContext(context).draw();

      ok(true, "Auto Align Rests - Default Test");
    },


    staveRestsAll: function(options, b) {
      var { context, stave } = VF.Test.Rests.setupContext(options, b, 600, 160);

      stave.addTimeSignature("4/4");

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

      var beam = new VF.Beam(notes.slice(5, 9));
      var tuplet = new VF.Tuplet(notes.slice(9, 12)).setTupletLocation(VF.Tuplet.LOCATION_TOP);

      var voice = new VF.Voice(VF.Test.TIME4_4)
        .setStrict(false)
        .addTickables(notes)
        .setStave(stave);

      // Instantiate a `Formatter` and format the notes.
      new VF.Formatter()
        .joinVoices([voice], { align_rests: true })
        .formatToStave([voice], stave, { align_rests: true, stave });

      stave.setContext(context).draw();
      voice.draw(context);
      tuplet.setContext(context).draw();
      beam.setContext(context).draw();

      ok(true, "Auto Align Rests - Align All Test");
    },

    multi: function(options, contextBuilder) {
      var context = new contextBuilder(options.canvas_sel, 600, 200);
      var stave = new VF.Stave(50, 10, 500)
        .addTrebleGlyph()
        .addTimeSignature("4/4")
        .setContext(context)
        .draw();

      var notes1 = [
        { keys: ["c/4", "e/4", "g/4"], duration: "q" },
        { keys: ["b/4"], duration: "qr" },
        { keys: ["c/4", "d/4", "a/4"], duration: "q" },
        { keys: ["b/4"], duration: "qr" },
      ].map(newNote);

      var notes2 = [
        { keys: ["e/3"], stem_direction: -1, duration: "8" },
        { keys: ["b/4"], stem_direction: -1, duration: "8r" },
        { keys: ["b/4"], stem_direction: -1, duration: "8r" },
        { keys: ["e/3"], stem_direction: -1, duration: "8" },
        { keys: ["e/3"], stem_direction: -1, duration: "8" },
        { keys: ["b/4"], stem_direction: -1, duration: "8r" },
        { keys: ["e/3"], stem_direction: -1, duration: "8" },
        { keys: ["e/3"], stem_direction: -1, duration: "8" },
      ].map(newNote);

      var voice1 = new VF.Voice(VF.Test.TIME4_4)
        .addTickables(notes1)
        .setStave(stave);

      var voice2 = new VF.Voice(VF.Test.TIME4_4)
        .addTickables(notes2)
        .setStave(stave);

      var beam2_1 = new VF.Beam(notes2.slice(0, 4));
      var beam2_2 = new VF.Beam(notes2.slice(4, 8));

      // Set option to position rests near the notes in each voice
      new VF.Formatter()
        .joinVoices([voice1, voice2], { align_rests: true })
        .formatToStave([voice1, voice2], stave, { align_rests: true, stave });

      voice1.draw(context);
      voice2.draw(context);
      beam2_1.setContext(context).draw();
      beam2_2.setContext(context).draw();

      ok(true, "Strokes Test Multi Voice");
    },
  };

  return Rests;
})();

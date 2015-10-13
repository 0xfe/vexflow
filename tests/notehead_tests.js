/**
 * VexFlow - NoteHead Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.NoteHead = (function() {
  var NoteHead = {
    Start: function(){
      QUnit.module("NoteHead");
      VF.Test.runTests("Basic", VF.Test.NoteHead.basic);
      VF.Test.runTests("Bounding Boxes", VF.Test.NoteHead.basicBoundingBoxes);
    },

    setupContext: function(options, x, y) {

      var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph();

      return {context: ctx, stave: stave};
    },

    basic: function(options, contextBuilder){
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 450, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: "4",
        line: 3
      });

      var note_head2 = new VF.NoteHead({
        duration: "1",
        line: 2.5
      });

      var note_head3 = new VF.NoteHead({
        duration: "2",
        line: 0
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      ok("Basic NoteHead test");
    },

    basicBoundingBoxes: function(options, contextBuilder){
      options.contextBuilder = contextBuilder;
      var c = VF.Test.NoteHead.setupContext(options, 350, 250);

      c.stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      c.context.scale(2.0, 2.0);
      c.stave.setContext(c.context).draw();

      var formatter = new VF.Formatter();
      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);

      var note_head1 = new VF.NoteHead({
        duration: "4",
        line: 3
      });

      var note_head2 = new VF.NoteHead({
        duration: "2",
        line: 2.5
      });

      var note_head3 = new VF.NoteHead({
        duration: "1",
        line: 0
      });

      voice.addTickables([note_head1, note_head2, note_head3]);
      formatter.joinVoices([voice]).formatToStave([voice], c.stave);

      voice.draw(c.context, c.stave);

      note_head1.getBoundingBox().draw(c.context);
      note_head2.getBoundingBox().draw(c.context);
      note_head3.getBoundingBox().draw(c.context);

      ok("NoteHead Bounding Boxes");
    }
  };

  return NoteHead;
})();
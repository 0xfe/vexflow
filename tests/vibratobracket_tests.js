/**
 * VexFlow - VibratoBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 * Author: Balazs Forian-Szabo
 */

VF.Test.VibratoBracket = (function(){
  var VibratoBracket = {
    Start: function() {
      QUnit.module("VibratoBracket");
      VF.Test.runTests("Simple VibratoBracket", VF.Test.VibratoBracket.simple);
      VF.Test.runTests("Harsh VibratoBracket", VF.Test.VibratoBracket.harsh);
    },

    simple: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1);
      var stave = new VF.Stave(10, 40, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var vibrato = new VF.VibratoBracket({
        start: notes[0],
        stop: notes[3],
      });
      vibrato.setLine(2);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      vibrato.setContext(ctx).draw();
      ok(true, "VibratoBracket Simple");
    },

    harsh: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;
      var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
      ctx.scale(1, 1);

      var stave = new VF.Stave(10, 40, 550).addTrebleGlyph();
      stave.setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var notes = [
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"},
        {keys: ["c/4"], duration: "4"}
      ].map(newNote);

      var voice = new VF.Voice(VF.TIME4_4).setStrict(false);
      voice.addTickables(notes);

      var vibrato = new VF.VibratoBracket({
        start: notes[2],
        stop: null,
      });
      vibrato.setLine(2);
      vibrato.setHarsh(true);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(ctx, stave);

      vibrato.setContext(ctx).draw();
      ok(true, "VibratoBracket Harsh");
    }
  };

  return VibratoBracket;
})();

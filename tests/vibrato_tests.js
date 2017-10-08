/**
 * VexFlow - Vibrato Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Vibrato = (function() {
  var Vibrato = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Vibrato');
      runTests('Simple Vibrato', Vibrato.simple);
      runTests('Harsh Vibrato', Vibrato.harsh);
      runTests('Vibrato with Bend', Vibrato.withBend);
    },

    simple: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 140);

      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h' })
          .addModifier(newVibrato(), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'h' })
          .addModifier(newVibrato(), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, 'Simple Vibrato');
    },

    harsh: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 240);

      ctx.scale(1.5, 1.5); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 10 }, { str: 4, fret: 9 }], duration: 'h' })
          .addModifier(newVibrato().setHarsh(true), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'h' })
          .addModifier(newVibrato().setHarsh(true), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, 'Harsh Vibrato');
    },

    withBend: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.3, 1.3); ctx.setFillStyle('#221'); ctx.setStrokeStyle('#221');
      ctx.setFont('Arial', VF.Test.Font.size, '');
      var stave = new VF.TabStave(10, 10, 450)
        .addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) { return new VF.TabNote(tab_struct); }
      function newBend(text, release) { return new VF.Bend(text, release); }
      function newVibrato() { return new VF.Vibrato(); }

      var notes = [
        newNote({
          positions: [{ str: 2, fret: 9 }, { str: 3, fret: 9 }], duration: 'q' })
          .addModifier(newBend('1/2', true), 0)
          .addModifier(newBend('1/2', true), 1)
          .addModifier(newVibrato(), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'q' })
          .addModifier(newBend('Full', false), 0)
          .addModifier(newVibrato().setVibratoWidth(60), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }], duration: 'h' })
          .addModifier(newVibrato().setVibratoWidth(120).setHarsh(true), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      ok(true, 'Vibrato with Bend');
    },
  };

  return Vibrato;
})();

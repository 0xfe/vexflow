/**
 * VexFlow - Auto-beaming Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;

VF.Test.BachDemo = (function() {
  function concat(a, b) { return a.concat(b); }

  var BachDemo = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Bach Demo');
      runTests('Minuet 1', BachDemo.minuet1);
    },

    minuet1: function(options) {
      var registry = new VF.Registry();
      VF.Registry.enableDefaultRegistry(registry);
      var vf = VF.Test.makeFactory(options, 1100, 600);
      var score = vf.EasyScore();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);
      var beam = score.beam.bind(score);

      var x = 120, y = 40;
      function makeSystem(width) {
        var system = vf.System({x: x, y: y, width: width, spaceBetweenStaves: 10});
        x += width;
        return system;
      }

      function id(id) { return registry.getElementById(id); }

      score.set({time: '3/4'});

      /*  Measure 1 */
      var system = makeSystem(220);
      system.addStave({
        voices: [
          voice([
            notes('D5/q[id="d1"]'),
            beam(notes('G4/8, A4, B4, C5', {stem: "up"}))
          ].reduce(concat)),
          voice([vf.TextDynamics({text: 'p', duration: 'h', dots: 1, line: 9 })]),
        ]
      }).addClef('treble').addKeySignature('G').addTimeSignature('3/4');

      system.addStave({ voices: [voice(notes('(G3 B3 D4)/h, A3/q', {clef: 'bass'}))] })
        .addClef('bass').addKeySignature('G').addTimeSignature('3/4');
      system.addConnector('brace');
      system.addConnector('singleRight');
      system.addConnector('singleLeft');

      id('d1').addModifier(0, vf.Fingering({number: '5'}));

      /*  Measure 2 */
      system = makeSystem(150);
      system.addStave({ voices: [voice(notes('D5/q[id="d2"], G4[id="g3"], G4[id="g4"]'))] });
      system.addStave({ voices: [voice(notes('B3/h.', {clef: 'bass'}))] });
      system.addConnector('singleRight');

      id('d2').addModifier(0, vf.Articulation({type: 'a.', position: "above"}));
      id('g3').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('g4').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));

      vf.Curve({
        from: id('d1'),
        to: id('d2'),
        options: { cps: [{x: 0, y: 40}, {x: 0, y: 40}]}
      });

      /*  Measure 3 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('E5/q[id="e1"]'),
            beam(notes('C5/8, D5, E5, F5', {stem: "down"}))
          ].reduce(concat))
        ]
      });
      id('e1').addModifier(0, vf.Fingering({number: '3', position: 'above'}));

      system.addStave({ voices: [ voice(notes('C4/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      /*  Measure 4 */
      system = makeSystem(150);
      system.addStave({ voices: [ voice(notes('G5/q[id="g5"], G4[id="g6"], G4[id="g7"]')) ] });

      system.addStave({ voices: [ voice(notes('B3/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      id('g5').addModifier(0, vf.Articulation({type: 'a.', position: "above"}));
      id('g6').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('g7').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));

      vf.Curve({
        from: id('e1'),
        to: id('g5'),
        options: { cps: [{x: 0, y: 20}, {x: 0, y: 20}]}
      });

      /*  Measure 5 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('C5/q[id="m5a"]'),
            beam(notes('D5/8, C5, B4, A4', {stem: "down"}))
          ].reduce(concat))
        ]
      });
      id('m5a').addModifier(0, vf.Fingering({number: '4', position: 'above'}));

      system.addStave({ voices: [ voice(notes('A3/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      /*  Measure 6 */
      system = makeSystem(150);
      system.addStave({
        voices: [
          voice([
            notes('B5/q'),
            beam(notes('C5/8, B4, A4, G4[id="m6a"]', {stem: "up"}))
          ].reduce(concat))
        ]
      });

      system.addStave({ voices: [ voice(notes('G3/h.', {clef: 'bass'})) ] });
      system.addConnector('singleRight');

      vf.Curve({
        from: id('m5a'),
        to: id('m6a'),
        options: {
          cps: [{x: 0, y: 20}, {x: 0, y: 20}],
          invert: true,
          position_end: 'nearTop',
          y_shift: 20,
        }
      });

      /*  Measure 7 (New system) */
      x = 20;
      y += 200;

      var system = makeSystem(220);
      system.addStave({
        voices: [
          voice([
            notes('F4/q[id="m7a"]'),
            beam(notes('G4/8[id="m7b"], A4, B4, G4', {stem: "up"}))
          ].reduce(concat))
        ]
      }).addClef('treble').addKeySignature('G');

      system.addStave({ voices: [voice(notes('D4/q, B3[id="m7c"], G3', {clef: 'bass'}))] })
        .addClef('bass').addKeySignature('G');
      system.addConnector('brace');
      system.addConnector('singleRight');
      system.addConnector('singleLeft');

      id('m7a').addModifier(0, vf.Fingering({number: '2', position: 'below'}));
      id('m7b').addModifier(0, vf.Fingering({number: '1'}));
      id('m7c').addModifier(0, vf.Fingering({number: '3', position: 'above'}));

      /*  Measure 8 */
      system = makeSystem(180);
      var grace = vf.GraceNote({keys: ['d/3'], clef: 'bass', duration: '8', slash: true });

      system.addStave({ voices: [voice(notes('A4/h.[id="m8c"]'))] });
      system.addStave({ voices: [
         score.set({clef: 'bass'}).voice([
            notes('D4/q[id="m8a"]'),
            beam(notes('D3/8, C4, B3[id="m8b"], A3', {stem: "down"}))
          ].reduce(concat))
      ]});
      system.addConnector('singleRight');

      id('m8b').addModifier(0, vf.Fingering({number: '1', position: 'above'}));
      id('m8c').addModifier(0, vf.GraceNoteGroup({notes: [grace]}));

      vf.Curve({
        from: id('m7a'),
        to: id('m8c'),
        options: {
          cps: [{x: 0, y: 20}, {x: 0, y: 20}],
          invert: true,
          position: 'nearTop',
          position_end: 'nearTop',
        }
      });

      vf.StaveTie({from: grace, to: id('m8c')});

      /* Done */

      vf.draw();
      VF.Registry.disableDefaultRegistry();
      ok(true, 'Bach Minuet 1');
    },
  };

  return BachDemo;
})();

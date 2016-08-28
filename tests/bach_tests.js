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
      var vf = VF.Test.makeFactory(options, 900, 600);
      var score = vf.EasyScore();

      var voice = score.voice.bind(score);
      var notes = score.notes.bind(score);
      var beam = score.beam.bind(score);
      score.set({time: '3/4'});

      var x = 20, y = 40;
      function makeSystem(width) {
        var system = vf.System({x: x, y: y, width: width, spaceBetweenStaves: 10});
        x += width;
        return system;
      }

      function id(id) { return registry.getElementById(id); }

      var system = makeSystem(220);
      system.addStave({
        voices: [
          voice([
            notes('D5/q[id="d1"]'),
            beam(notes('G4/8, A4, B4, C5', {stem: "up"}))
          ].reduce(concat)),
          voice([
            vf.TextDynamics({text: 'p', duration: 'h', dots: 1, line: 9 }),
          ], {time: '3/4'}),
        ]
      }).addClef('treble').addKeySignature('G').addTimeSignature('3/4');

      system.addStave({
        voices: [
          voice(notes('(G3 B3 D4)/h, A3/q', {clef: 'bass'}))
        ]
      }).addClef('bass').addKeySignature('G').addTimeSignature('3/4');
      system.addConnector().setType('brace');
      system.addConnector().setType('singleRight');
      system.addConnector().setType('singleLeft');

      id('d1').addModifier(0, vf.Fingering({number: '5'}));

      system = makeSystem(150);
      system.addStave({
        voices: [
          voice(notes('D5/q[id="d2"], G4[id="g3"], G4[id="g4"]'))
        ]
      });

      system.addStave({
        voices: [
          voice(notes('B3/h.', {clef: 'bass'}))
        ]
      });
      system.addConnector().setType('singleRight');

      id('d2').addModifier(0, vf.Articulation({type: 'a.', position: "above"}));
      id('g3').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('g4').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));

      vf.Curve({
        from: id('d1'),
        to: id('d2'),
        options: { cps: [{x: 0, y: 40}, {x: 0, y: 40}]}
      });

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

      system.addStave({
        voices: [
          voice(notes('C4/h.[id="c1"]', {clef: 'bass'}))
        ]
      });
      system.addConnector().setType('singleRight');

      system = makeSystem(150);
      system.addStave({
        voices: [
          voice(notes('G5/q[id="g5"], G4[id="g6"], G4[id="g7"]'))
        ]
      });

      system.addStave({
        voices: [
          voice(notes('B3/h.', {clef: 'bass'}))
        ]
      });
      system.addConnector().setType('singleRight');

      id('g5').addModifier(0, vf.Articulation({type: 'a.', position: "above"}));
      id('g6').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));
      id('g7').addModifier(0, vf.Articulation({type: 'a.', position: "below"}));

      vf.Curve({
        from: id('e1'),
        to: id('g5'),
        options: { cps: [{x: 0, y: 20}, {x: 0, y: 20}]}
      });

      vf.draw();

      VF.Registry.disableDefaultRegistry();
      ok(true, 'Bach Minuet 1');
    },
  };

  return BachDemo;
})();

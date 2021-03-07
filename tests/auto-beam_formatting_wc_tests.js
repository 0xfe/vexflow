/**
 * VexFlow - Auto-beaming Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.AutoBeamFormattingWebComponents = (function() {
  var AutoBeamFormattingWebComponents = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('Auto-Beaming: WebComponents');
      runTests('Simple Auto Beaming', AutoBeamFormattingWebComponents.simpleAuto);
      runTests('Even Group Stem Directions', AutoBeamFormattingWebComponents.evenGroupStemDirections);
      runTests('More Simple Auto Beaming 0', AutoBeamFormattingWebComponents.moreSimple0);
      runTests('More Simple Auto Beaming 1', AutoBeamFormattingWebComponents.moreSimple1);
    },

    simpleAuto: function(options) {
      const template = document.createElement('template');
      template.innerHTML = `
        <vf-score id=${options.scoreId} width=450 height=140 renderer='canvas'>
          <vf-system>
            <vf-stave clef='treble' timeSig='4/4'>
              <vf-voice autoBeam>f5/8, e5, d5, c5/16, c5, d5/8, e5, f5, f5/32, f5, f5, f5</vf-voice>
            </vf-stave>
          </vf-system>  
        </vf-score>
      `;
      document.body.appendChild(document.importNode(template.content, true));
      ok(true, 'Web Components: Auto Beaming Applicator Test');
    },

    evenGroupStemDirections: function(options) {
      const template = document.createElement('template');
      template.innerHTML = `
        <vf-score id=${options.scoreId} width=450 height=140 renderer='canvas'>
          <vf-system>
            <vf-stave clef='treble' timeSig='6/4'>
              <vf-voice autoBeam>a4/8, b4, g4, c5, f4, d5, e4, e5, b4, b4, g4, d5</vf-voice>
            </vf-stave>
          </vf-system>  
        </vf-score>
      `;
      document.body.appendChild(document.importNode(template.content, true));

      // TODO: figure out how to test this with web components?
      // var UP = VF.Stem.UP;
      // var DOWN = VF.Stem.DOWN;
      // equal(beams[0].stem_direction, UP);
      // equal(beams[1].stem_direction, UP);
      // equal(beams[2].stem_direction, UP);
      // equal(beams[3].stem_direction, UP);
      // equal(beams[4].stem_direction, DOWN);
      // equal(beams[5].stem_direction, DOWN);

      ok(true, 'Web Components: Auto Beaming Applicator Test');
    },

    moreSimple0: function(options) {
      const template = document.createElement('template');
      template.innerHTML = `
        <vf-score id=${options.scoreId} width=450 height=140 renderer='canvas'>
          <vf-system>
            <vf-stave clef='treble' timeSig='4/4'>
              <vf-voice autoBeam>c4/8, g4, c5, g5, a5, c4, d4, a5</vf-voice>
            </vf-stave>
          </vf-system>  
        </vf-score>
      `;
      document.body.appendChild(document.importNode(template.content, true));
      ok(true, 'Web Components: Auto Beaming Applicator Test');
    },

    moreSimple1: function(options) {
      const template = document.createElement('template');
      template.innerHTML = `
        <vf-score id=${options.scoreId} width=450 height=140 y=10 renderer='canvas'>
          <vf-system>
            <vf-stave clef='treble' timeSig='4/4'>
              <vf-voice autoBeam>c5/16, g5, c5, c5/r, c5/r, (c4 e4 g4), d4, a5, c4, g4, c5, b4/r, (c4 e4), b4/r, b4/r, a4</vf-voice>
            </vf-stave>
          </vf-system>  
        </vf-score>
      `;
      document.body.appendChild(document.importNode(template.content, true));
      ok(true, 'Web Components: Auto Beaming Applicator Test');
    }
  };

  return AutoBeamFormattingWebComponents;
})();

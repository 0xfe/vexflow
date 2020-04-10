const VF = Vex.Flow;

function subgroup(el, iterations, params) {
  const options = {
    width: 650,
    height: 350,
    systemWidth: 550,
    debug: true,
    ...params,
  };

  const vf = new VF.Factory({
    renderer: {
      elementId: el,
      width: options.width,
      height: options.height,
    }
  });

  vf.StaveNote = vf.StaveNote.bind(vf);

  var stave1 = vf.Stave({ x: 15, y: 40, width: options.systemWidth }).setClef('treble');
  var notes1 = [
    { keys: ['f/5'], stem_direction: 1, duration: '4' },
    { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
    { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
    { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
  ].map(vf.StaveNote);

  var notes2 = [
    { keys: ['c/4'], stem_direction: -1, duration: '4' },
    { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
    { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
    { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
  ].map(vf.StaveNote);

  var stave2 = vf.Stave({ x: 15, y: 160, width: options.systemWidth }).setClef('bass');

  var notes3 = [
    { keys: ['e/3'], duration: '8', stem_direction: -1, clef: 'bass' },
    { keys: ['g/4'], duration: '8', stem_direction: 1, clef: 'treble' },
    { keys: ['d/4'], duration: '8', stem_direction: 1, clef: 'treble' },
    { keys: ['f/4'], duration: '8', stem_direction: 1, clef: 'treble' },
    { keys: ['c/4'], duration: '8', stem_direction: 1, clef: 'treble' },
    { keys: ['g/3'], duration: '8', stem_direction: -1, clef: 'bass' },
    { keys: ['d/3'], duration: '8', stem_direction: -1, clef: 'bass' },
    { keys: ['f/3'], duration: '8', stem_direction: -1, clef: 'bass' },
  ].map(vf.StaveNote);

  vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'brace' });
  vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleLeft' });
  vf.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleRight' });

  function addAccidental(note, acc) {
    return note.addModifier(0, vf.Accidental({ type: acc }));
  }
  function addSubGroup(note, subNotes) {
    return note.addModifier(0, vf.NoteSubGroup({ notes: subNotes }));
  }

  vf.Beam({ notes: notes3.slice(1, 4) });
  vf.Beam({ notes: notes3.slice(5) });

  addAccidental(notes1[1], '#');
  addSubGroup(notes1[1], [
    vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
    vf.TimeSigNote({ time: '3/4' }),
  ]);
  addSubGroup(notes2[2], [
    vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
    vf.TimeSigNote({ time: '9/8' }),
  ]);
  addSubGroup(notes1[3], [vf.ClefNote({ type: 'soprano', options: { size: 'small' } })]);
  addSubGroup(notes3[1], [vf.ClefNote({ type: 'treble', options: { size: 'small' } })]);
  addSubGroup(notes3[5], [vf.ClefNote({ type: 'bass', options: { size: 'small' } })]);
  addAccidental(notes3[0], '#');
  addAccidental(notes3[3], 'b');
  addAccidental(notes3[5], '#');
  addAccidental(notes1[2], 'b');
  addAccidental(notes2[3], '#');

  var voice = vf.Voice().addTickables(notes1);
  var voice2 = vf.Voice().addTickables(notes2);
  var voice3 = vf.Voice().addTickables(notes3);

  const formatter = vf.Formatter();
  formatter
    .joinVoices([voice, voice2])
    .joinVoices([voice3])
    .formatToStave([voice, voice2, voice3], stave1);

  for (let i = 0; i < iterations; i++) {
    formatter.tune();
  }

  vf.draw();
  if (options.debug) {
    VF.Formatter.plotDebugging(vf.getContext(), formatter, stave1.getNoteStartX(), 20, 320);
  }
}

function tuplets(el, iterations, params) {
  const options = {
    width: 600,
    height: 800,
    systemWidth: 500,
    debug: true,
    ...params,
  };

  const vf = new VF.Factory({
    renderer: {
      elementId: el,
      width: options.width,
      height: options.height,
    }
  });

  var system = vf.System({
    x: 50,
    width: options.systemWidth,
    debugFormatter: options.debug,
    formatIterations: iterations
  });

  var score = vf.EasyScore();

  var newVoice = function(notes) {
    return score.voice(notes, { time: '1/4' });
  };

  var newStave = function(voice) {
    return system
      .addStave({ voices: [voice], debugNoteMetrics: options.debug })
      .addClef('treble')
      .addTimeSignature('1/4');
  };

  var voices = [
    score.notes('c5/8, c5'),
    score.tuplet(score.notes('a4/8, a4, a4'), { notes_occupied: 2 }),
    score.notes('c5/16, c5, c5, c5'),
    score.tuplet(score.notes('a4/16, a4, a4, a4, a4'), { notes_occupied: 4 }),
    score.tuplet(score.notes('a4/32, a4, a4, a4, a4, a4, a4'), { notes_occupied: 8 }),
  ];

  voices.map(newVoice).forEach(newStave);
  system.addConnector().setType(VF.StaveConnector.type.BRACKET);

  vf.draw();
}

const Tests = {
  'tuplets': tuplets,
  'subgroup': subgroup,
};

module.exports = Tests;

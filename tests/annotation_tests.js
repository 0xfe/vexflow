/**
 * VexFlow - Annotation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Annotation = (function () {
  var runTests = VF.Test.runTests;
  var Annotation = {
    Start: function () {
      QUnit.module('Annotation');
      runTests('Lyrics', Annotation.lyrics);
      runTests('Simple Annotation', Annotation.simple);
      runTests('Standard Notation Annotation', Annotation.standard);
      runTests('Harmonics', Annotation.harmonic);
      runTests('Fingerpicking', Annotation.picking);
      runTests('Bottom Annotation', Annotation.bottom);
      runTests('Bottom Annotations with Beams', Annotation.bottomWithBeam);
      runTests('Test Justification Annotation Stem Up', Annotation.justificationStemUp);
      runTests('Test Justification Annotation Stem Down', Annotation.justificationStemDown);
      runTests('TabNote Annotations', Annotation.tabNotes);
    },
    buildNotesFromJson: function(json) {
      const rv = {
        notes: [],
        beamGroups: []
      };
      let currentBeam = [];
      const beamNotes = () => {
        if (currentBeam.length > 1) {
          rv.beamGroups.push(new VF.Beam(currentBeam));
        }
        currentBeam = [];
      };
      json.notes.forEach((nn) => {
        const keys = nn.pitches.map((pp) => pp.pitch.key);
        const params = {
          duration: nn.duration,
          keys,
          clef: nn.clef
        };
        const note = new VF.StaveNote(params);
        nn.lyrics.forEach((lyric) => {
          const vexL = new VF.Annotation(lyric.text);
          vexL.setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
          note.addAnnotation(lyric.verse, vexL);
        });
        if (nn.duration.indexOf('d') >= 0) {
          note.addDotToAll();
        }
        if (note.ticks.value() <= 2048) {
          currentBeam.push(note);
          if (nn.endBeam) {
            beamNotes();
          }
        } else {
          beamNotes();
        }
        nn.pitches.forEach((pp, ix) => {
          if (pp.pitch.accidental) {
            note.addAccidental(ix, new VF.Accidental(pp.pitch.accidental));
          }
        });
        rv.notes.push(note);
      });
      beamNotes();
      rv.voice = new VF.Voice({
        num_beats: json.beats.num_beats,
        beat_value: json.beats.beat_value
      });
      rv.voice.addTickables(rv.notes);
      return rv;
    },
    drawMusic(context, formatter, musicArray) {
      let y = 40;
      const voices = [];
      musicArray.forEach((music) => {
        formatter.joinVoices([music.voice]);
        voices.push(music.voice);
      });
      const width = formatter.preCalculateMinTotalWidth(voices);
      formatter.format(voices, width);
      voices.forEach((voice) => {
        const stave = new VF.Stave(10, y, width + 20);
        y += 120;
        stave.setContext(context).draw();
        voice.draw(context, stave);
      });
      musicArray.forEach((music) => {
        music.beamGroups.forEach((beam) => {
          beam.setContext(context).draw();
        });
      });
    },
    lyrics: function(options) {
      const json1 =
        [
          {
            'notes': [
              {
                'pitches': [
                  {
                    'pitch': {
                      'key': 'cn/4'
                    }
                  },
                  {
                    'pitch': {
                      'key': 'fn/4'
                    }
                  }
                ],
                'duration': '2',
                'lyrics': [
                  {
                    'text': 'hand,',
                    'verse': 0
                  },
                  {
                    'text': 'pears ',
                    'verse': 1
                  }
                ],
                'clef': 'treble',
                'endBeam': false
              },
              {
                'pitches': [
                  {
                    'pitch': {
                      'key': 'cn/4'
                    }
                  },
                  {
                    'pitch': {
                      'key': 'an/4'
                    }
                  }
                ],
                'duration': '8',
                'lyrics': [
                  {
                    'text': 'and  ',
                    'verse': 1
                  },
                  {
                    'text': 'lead  ',
                    'verse': 0
                  }
                ],
                'clef': 'treble',
                'endBeam': false
              },
              {
                'pitches': [
                  {
                    'pitch': {
                      'key': 'c#/4',
                      'accidental': '#'
                    }
                  },
                  {
                    'pitch': {
                      'key': 'an/4'
                    }
                  }
                ],
                'duration': '8',
                'lyrics': [
                  {
                    'text': 'me',
                    'verse': 0
                  },
                  {
                    'text': 'the',
                    'verse': 1
                  }
                ],
                'clef': 'treble',
                'endBeam': false
              }
            ],
            'beats': {
              'num_beats': 3,
              'beat_value': 4
            }
          }
        ];
      const json2 = [
        {
          'notes': [
            {
              'pitches': [
                {
                  'pitch': {
                    'key': 'an/2'
                  }
                },
                {
                  'pitch': {
                    'key': 'fn/3'
                  }
                }
              ],
              'duration': '2',
              'lyrics': [
                {
                  'text': ' ',
                  'verse': 0
                }
              ],
              'clef': 'bass',
              'endBeam': false
            },
            {
              'pitches': [
                {
                  'pitch': {
                    'key': 'fn/2'
                  }
                },
                {
                  'pitch': {
                    'key': 'fn/3'
                  }
                }
              ],
              'duration': '8',
              'lyrics': [],
              'clef': 'bass',
              'endBeam': false
            },
            {
              'pitches': [
                {
                  'pitch': {
                    'key': 'fn/2'
                  }
                },
                {
                  'pitch': {
                    'key': 'fn/3'
                  }
                }
              ],
              'duration': '8',
              'lyrics': [],
              'clef': 'bass',
              'endBeam': false
            }
          ],
          'beats': {
            'num_beats': 3,
            'beat_value': 4
          }
        }
      ];
      var vf = VF.Test.makeFactory(options, 750, 280);
      const context = vf.getContext();
      const formatter = new VF.Formatter({ softmaxFactor: 100 });
      const musicArray = [];
      musicArray.push(Annotation.buildNotesFromJson(json1[0]));
      musicArray.push(Annotation.buildNotesFromJson(json2[0]));
      Annotation.drawMusic(context, formatter, musicArray);
      ok(true);
    },
    simple: function(options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) {
        return new VF.TabNote(tab_struct);
      }
      function newBend(text) {
        return new VF.Bend(text);
      }
      function newAnnotation(text) {
        return new VF.Annotation(text);
      }

      var notes = [
        newNote({
          positions: [
            { str: 2, fret: 10 },
            { str: 4, fret: 9 },
          ],
          duration: 'h',
        }).addModifier(newAnnotation('T'), 0),
        newNote({
          positions: [{ str: 2, fret: 10 }],
          duration: 'h',
        })
          .addModifier(newAnnotation('T'), 0)
          .addModifier(newBend('Full'), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'Simple Annotation');
    },

    standard: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      var stave = new VF.Stave(10, 10, 450).addClef('treble').setContext(ctx).draw();

      function newNote(note_struct) {
        return new VF.StaveNote(note_struct);
      }
      function newAnnotation(text) {
        return new VF.Annotation(text).setFont('Times', VF.Test.Font.size, 'italic');
      }

      var notes = [
        newNote({ keys: ['c/4', 'e/4'], duration: 'h' }).addAnnotation(0, newAnnotation('quiet')),
        newNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'h' }).addAnnotation(2, newAnnotation('Allegro')),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'Standard Notation Annotation');
    },

    harmonic: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) {
        return new VF.TabNote(tab_struct);
      }
      function newAnnotation(text) {
        return new VF.Annotation(text);
      }

      var notes = [
        newNote({
          positions: [
            { str: 2, fret: 12 },
            { str: 3, fret: 12 },
          ],
          duration: 'h',
        }).addModifier(newAnnotation('Harm.'), 0),
        newNote({
          positions: [{ str: 2, fret: 9 }],
          duration: 'h',
        })
          .addModifier(newAnnotation('(8va)').setFont('Times', VF.Test.Font.size, 'italic'), 0)
          .addModifier(newAnnotation('A.H.'), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'Simple Annotation');
    },

    picking: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');
      ctx.setFont('Arial', VF.Test.Font.size, '');
      var stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

      function newNote(tab_struct) {
        return new VF.TabNote(tab_struct);
      }
      function newAnnotation(text) {
        return new VF.Annotation(text).setFont('Times', VF.Test.Font.size, 'italic');
      }

      var notes = [
        newNote({
          positions: [
            { str: 1, fret: 0 },
            { str: 2, fret: 1 },
            { str: 3, fret: 2 },
            { str: 4, fret: 2 },
            { str: 5, fret: 0 },
          ],
          duration: 'h',
        }).addModifier(new VF.Vibrato().setVibratoWidth(40)),
        newNote({
          positions: [{ str: 6, fret: 9 }],
          duration: '8',
        }).addModifier(newAnnotation('p'), 0),
        newNote({
          positions: [{ str: 3, fret: 9 }],
          duration: '8',
        }).addModifier(newAnnotation('i'), 0),
        newNote({
          positions: [{ str: 2, fret: 9 }],
          duration: '8',
        }).addModifier(newAnnotation('m'), 0),
        newNote({
          positions: [{ str: 1, fret: 9 }],
          duration: '8',
        }).addModifier(newAnnotation('a'), 0),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 200);
      ok(true, 'Fingerpicking');
    },

    bottom: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      var stave = new VF.Stave(10, 10, 300).addClef('treble').setContext(ctx).draw();

      function newNote(note_struct) {
        return new VF.StaveNote(note_struct);
      }
      function newAnnotation(text) {
        return new VF.Annotation(text)
          .setFont('Times', VF.Test.Font.size)
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
      }

      var notes = [
        newNote({ keys: ['f/4'], duration: 'w' }).addAnnotation(0, newAnnotation('F')),
        newNote({ keys: ['a/4'], duration: 'w' }).addAnnotation(0, newAnnotation('A')),
        newNote({ keys: ['c/5'], duration: 'w' }).addAnnotation(0, newAnnotation('C')),
        newNote({ keys: ['e/5'], duration: 'w' }).addAnnotation(0, newAnnotation('E')),
      ];

      VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      ok(true, 'Bottom Annotation');
    },

    bottomWithBeam: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 500, 240);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';
      var stave = new VF.Stave(10, 10, 300).addClef('treble').setContext(ctx).draw();

      // Create some notes
      var notes = [
        new VF.StaveNote({ keys: ['a/3'], duration: '8' }).addModifier(
          0,
          new VF.Annotation('good').setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)
        ),

        new VF.StaveNote({ keys: ['g/3'], duration: '8' }).addModifier(
          0,
          new VF.Annotation('even').setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)
        ),

        new VF.StaveNote({ keys: ['c/4'], duration: '8' }).addModifier(
          0,
          new VF.Annotation('under').setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)
        ),

        new VF.StaveNote({ keys: ['d/4'], duration: '8' }).addModifier(
          0,
          new VF.Annotation('beam').setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)
        ),
      ];

      var beam = new VF.Beam(notes.slice(1));

      VF.Formatter.FormatAndDraw(ctx, stave, notes);
      beam.setContext(ctx).draw();
      ok(true, 'Bottom Annotation with Beams');
    },

    justificationStemUp: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 650, 950);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';

      function newNote(note_struct) {
        return new VF.StaveNote(note_struct);
      }
      function newAnnotation(text, hJustifcation, vJustifcation) {
        return new VF.Annotation(text)
          .setFont('Arial', VF.Test.Font.size)
          .setJustification(hJustifcation)
          .setVerticalJustification(vJustifcation);
      }

      for (var v = 1; v <= 4; ++v) {
        var stave = new VF.Stave(10, (v - 1) * 150 + 40, 400).addClef('treble').setContext(ctx).draw();

        var notes = [];

        notes.push(newNote({ keys: ['c/3'], duration: 'q' }).addAnnotation(0, newAnnotation('Text', 1, v)));
        notes.push(newNote({ keys: ['c/4'], duration: 'q' }).addAnnotation(0, newAnnotation('Text', 2, v)));
        notes.push(newNote({ keys: ['c/5'], duration: 'q' }).addAnnotation(0, newAnnotation('Text', 3, v)));
        notes.push(newNote({ keys: ['c/6'], duration: 'q' }).addAnnotation(0, newAnnotation('Text', 4, v)));

        VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      }

      ok(true, 'Test Justification Annotation');
    },

    justificationStemDown: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 650, 1000);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';

      function newNote(note_struct) {
        return new VF.StaveNote(note_struct);
      }
      function newAnnotation(text, hJustifcation, vJustifcation) {
        return new VF.Annotation(text)
          .setFont('Arial', VF.Test.Font.size)
          .setJustification(hJustifcation)
          .setVerticalJustification(vJustifcation);
      }

      for (var v = 1; v <= 4; ++v) {
        var stave = new VF.Stave(10, (v - 1) * 150 + 40, 400).addClef('treble').setContext(ctx).draw();

        var notes = [];

        notes.push(
          newNote({ keys: ['c/3'], duration: 'q', stem_direction: -1 }).addAnnotation(0, newAnnotation('Text', 1, v))
        );
        notes.push(
          newNote({ keys: ['c/4'], duration: 'q', stem_direction: -1 }).addAnnotation(0, newAnnotation('Text', 2, v))
        );
        notes.push(
          newNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }).addAnnotation(0, newAnnotation('Text', 3, v))
        );
        notes.push(
          newNote({ keys: ['c/6'], duration: 'q', stem_direction: -1 }).addAnnotation(0, newAnnotation('Text', 4, v))
        );

        VF.Formatter.FormatAndDraw(ctx, stave, notes, 100);
      }

      ok(true, 'Test Justification Annotation');
    },

    tabNotes: function (options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 200);
      ctx.font = '10pt Arial';
      var stave = new VF.TabStave(10, 10, 550);
      stave.setContext(ctx);
      stave.draw();

      var specs = [
        {
          positions: [
            { str: 3, fret: 6 },
            { str: 4, fret: 25 },
          ],
          duration: '8',
        },
        {
          positions: [
            { str: 2, fret: 10 },
            { str: 5, fret: 12 },
          ],
          duration: '8',
        },
        {
          positions: [
            { str: 1, fret: 6 },
            { str: 3, fret: 5 },
          ],
          duration: '8',
        },
        {
          positions: [
            { str: 1, fret: 6 },
            { str: 3, fret: 5 },
          ],
          duration: '8',
        },
      ];

      var notes = specs.map(function (noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        return tabNote;
      });

      var notes2 = specs.map(function (noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        tabNote.render_options.draw_stem = true;
        tabNote.setStemDirection(-1);
        return tabNote;
      });

      var notes3 = specs.map(function (noteSpec) {
        var tabNote = new VF.TabNote(noteSpec);
        return tabNote;
      });

      notes[0].addModifier(new VF.Annotation('Text').setJustification(1).setVerticalJustification(1), 0); // U
      notes[1].addModifier(new VF.Annotation('Text').setJustification(2).setVerticalJustification(2), 0); // D
      notes[2].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(3), 0); // U
      notes[3].addModifier(new VF.Annotation('Text').setJustification(4).setVerticalJustification(4), 0); // D

      notes2[0].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(1), 0); // U
      notes2[1].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(2), 0); // D
      notes2[2].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(3), 0); // U
      notes2[3].addModifier(new VF.Annotation('Text').setJustification(3).setVerticalJustification(4), 0); // D

      notes3[0].addModifier(new VF.Annotation('Text').setVerticalJustification(1), 0); // U
      notes3[1].addModifier(new VF.Annotation('Text').setVerticalJustification(2), 0); // D
      notes3[2].addModifier(new VF.Annotation('Text').setVerticalJustification(3), 0); // U
      notes3[3].addModifier(new VF.Annotation('Text').setVerticalJustification(4), 0); // D

      var voice = new VF.Voice(VF.Test.TIME4_4).setMode(VF.Voice.Mode.SOFT);

      voice.addTickables(notes);
      voice.addTickables(notes2);
      voice.addTickables(notes3);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      voice.draw(ctx, stave);

      ok(true, 'TabNotes successfully drawn');
    },
  };

  return Annotation;
})();

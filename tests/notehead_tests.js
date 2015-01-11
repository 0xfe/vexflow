Vex.Flow.Test.NoteHead = {};

Vex.Flow.Test.NoteHead.Start = function(){
  module("NoteHead");
  Vex.Flow.Test.runTests("Basic", Vex.Flow.Test.NoteHead.basic);
  Vex.Flow.Test.runTests("Bounding Boxes", Vex.Flow.Test.NoteHead.basicBoundingBoxes);
};

Vex.Flow.Test.NoteHead.setupContext = function(options, x, y) {

  var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, x || 450).addTrebleGlyph();

  return {context: ctx, stave: stave};
};

Vex.Flow.Test.NoteHead.basic = function(options, contextBuilder){
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.NoteHead.setupContext(options, 450, 250);

  c.stave = new Vex.Flow.Stave(10, 0, 250).addTrebleGlyph();

  c.context.scale(2.0, 2.0);
  c.stave.setContext(c.context).draw();

  var formatter = new Vex.Flow.Formatter();
  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);

  var note_head1 = new Vex.Flow.NoteHead({
    duration: "4",
    line: 3
  });

  var note_head2 = new Vex.Flow.NoteHead({
    duration: "1",
    line: 2.5
  });

  var note_head3 = new Vex.Flow.NoteHead({
    duration: "2",
    line: 0
  });

  voice.addTickables([note_head1, note_head2, note_head3]);  
  formatter.joinVoices([voice]).formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  ok("Basic NoteHead test");
};

Vex.Flow.Test.NoteHead.basicBoundingBoxes = function(options, contextBuilder){
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.NoteHead.setupContext(options, 350, 250);

  c.stave = new Vex.Flow.Stave(10, 0, 250).addTrebleGlyph();

  c.context.scale(2.0, 2.0);
  c.stave.setContext(c.context).draw();

  var formatter = new Vex.Flow.Formatter();
  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);

  var note_head1 = new Vex.Flow.NoteHead({
    duration: "4",
    line: 3
  });

  var note_head2 = new Vex.Flow.NoteHead({
    duration: "2",
    line: 2.5
  });

  var note_head3 = new Vex.Flow.NoteHead({
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
};


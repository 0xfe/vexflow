Vex.Flow.GraceNoteGroup = (function(){
  var GraceNoteGroup = function(graceNotes) {
    this.init(graceNotes);
  };

  GraceNoteGroup.ornaments = {
    graceG: ['g/5'],
    graceD: ['d/5'],
    graceE: ['e/5'],
    throwA: ['a/5', 'g/5'],
    throwG: ['g/5', 'f/5'],
    throwD: ['g/4', 'd/5', 'c/5'],
    doublingLowG: ['g/5', 'g/4', 'd/5'],
    doublingLowA: ['g/5', 'a/4', 'd/5'],
    doublingB: ['g/5', 'b/4', 'd/5'],
    doublingC: ['g/5', 'c/5', 'd/5'],
    doublingD: ['g/5', 'd/5', 'e/5'],
    doublingE: ['g/5', 'e/5', 'f/5'],
    doublingF: ['g/5', 'f/5', 'g/5'],
    birl: ['g/4', 'a/4', 'g/4'],
    birlLeadingA: ['a/4', 'g/4', 'a/4', 'g/4'],
    birlGraceG: ['g/5', 'a/4', 'g/4', 'a/4', 'g/4'],
    grip: ['g/4', 'd/5', 'g/4'],
    taorluath: ['g/4', 'd/5', 'g/4', 'e/5']
  };

  Vex.Inherit(GraceNoteGroup, Vex.Flow.Modifier, {
    init: function(graceNotes) {
      var superclass = GraceNoteGroup.superclass;
      superclass.init.call(this);

      this.note = null;
      this.index = null;
      this.position = Vex.Flow.Modifier.Position.LEFT;
      this.graceNotes = graceNotes;
    },

    getCategory: function() { return "gracenotes"; },
    getNote: function() { return this.note; },
    setNote: function(note)
      { this.note = note; return this; },
    getIndex: function() { return this.index; },
    setIndex: function(index) {
      this.index = index; return this; },

    draw: function() {
      if (!this.context)  {
        throw new Vex.RuntimeError("NoContext", 
          "Can't draw trill without a context.");
      }

      if (!(this.note && (this.index != null))) {
        throw new Vex.RuntimeError("NoAttachedNote",
          "Can't draw grace note without a parent note and parent note index.");
      }
      
      var start = this.note.getModifierStartXY(this.position, this.index);
      var parentX = this.note.getAbsoluteX();
      var numGraceNotes = this.graceNotes.keys.length;
      var graceNoteStructTemplate = {
      
      }
      
      // Each grace note should be a separate StaveNote... no support for grace-chords if there is such a thing
      var graceNotes = [];
      for (var i = 0; i < numGraceNotes; i++) {
      var grace = new Vex.Flow.StaveNote({
        keys: [this.graceNotes.keys[i]],
        duration: this.graceNotes.duration, // All grace notes in the group should share the same duration
        isGraceNote: true // Signal for StaveNote to behave slightly differently
      });
      
      // Absolutely position based on the parent note's position
      // TODO: Positioning needs to be rethought here especially with larger groups of grace notes
      grace.setX(parentX - ((numGraceNotes - i) * 6) - 10);
      grace.setStave(this.note.stave);
      grace.context = this.context;
      graceNotes.push(grace);
      }
      
      if (numGraceNotes > 1) {
      new Vex.Flow.Beam(graceNotes).setContext(this.context).draw();
      }
      
      for (var j = 0; j < numGraceNotes; j++) {
      graceNotes[j].draw();
      }
    }
  });

return GraceNoteGroup;
}());
// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements diatonic key management.
//
// requires: vex.js   (Vex)
// requires: flow.js  (Vex.Flow)
// requires: music.js (Vex.Flow.Music)

/**
 * @constructor
 */
Vex.Flow.KeyManager = function(key) {
  this.init(key);
}

Vex.Flow.KeyManager.scales = {
  "M": Vex.Flow.Music.scales.major,
  "m": Vex.Flow.Music.scales.minor
};

Vex.Flow.KeyManager.prototype.init = function(key) {
  this.music = new Vex.Flow.Music();
  this.setKey(key);
}

Vex.Flow.KeyManager.prototype.setKey = function(key) {
  this.key = key;
  this.reset();
  return this;
}

Vex.Flow.KeyManager.prototype.getKey = function() {return this.key;}

Vex.Flow.KeyManager.prototype.reset = function() {
  this.keyParts = this.music.getKeyParts(this.key);

  this.keyString = this.keyParts.root;
  if (this.keyParts.accidental) this.keyString += this.keyParts.accidental;

  var is_supported_type = Vex.Flow.KeyManager.scales[this.keyParts.type];
  if (!is_supported_type)
    throw new Vex.RERR("BadArguments", "Unsupported key type: " + this.key);

  this.scale = this.music.getScaleTones(
      this.music.getNoteValue(this.keyString),
      Vex.Flow.KeyManager.scales[this.keyParts.type]);

  this.scaleMap = {};
  this.scaleMapByValue = {};
  this.originalScaleMapByValue = {};

  var noteLocation = Vex.Flow.Music.root_indices[this.keyParts.root];

  for (var i = 0; i < Vex.Flow.Music.roots.length; ++i) {
    var index = (noteLocation + i) % Vex.Flow.Music.roots.length;
    var rootName = Vex.Flow.Music.roots[index];

    var noteName = this.music.getRelativeNoteName(rootName, this.scale[i]);
    this.scaleMap[rootName] = noteName;
    this.scaleMapByValue[this.scale[i]] = noteName;
    this.originalScaleMapByValue[this.scale[i]] = noteName;
  }

  return this;
}

Vex.Flow.KeyManager.prototype.getAccidental = function(key) {
  var root = this.music.getKeyParts(key).root;
  var parts = this.music.getNoteParts(this.scaleMap[root]);

  return {
    note: this.scaleMap[root],
    accidental: parts.accidental
  }
}

Vex.Flow.KeyManager.prototype.selectNote = function(note) {
  note = note.toLowerCase();
  var parts = this.music.getNoteParts(note);

  // First look for matching note in our altered scale
  var scaleNote = this.scaleMap[parts.root];
  var modparts = this.music.getNoteParts(scaleNote);

  if (scaleNote == note) return {
    "note": scaleNote,
    "accidental": parts.accidental,
    "change": false
  }

  // Then search for a note of equivalent value in our altered scale
  var valueNote = this.scaleMapByValue[this.music.getNoteValue(note)];
  if (valueNote != null) {
    return {
      "note": valueNote,
      "accidental": this.music.getNoteParts(valueNote).accidental,
      "change": false
    }
  }

  // Then search for a note of equivalent value in the original scale
  var originalValueNote = this.originalScaleMapByValue[
    this.music.getNoteValue(note)];
  if (originalValueNote != null) {
    this.scaleMap[modparts.root] = originalValueNote;
    delete this.scaleMapByValue[this.music.getNoteValue(scaleNote)];
    this.scaleMapByValue[this.music.getNoteValue(note)] = originalValueNote;
    return {
      "note": originalValueNote,
      "accidental": this.music.getNoteParts(originalValueNote).accidental,
      "change": true
    }
  }

  // Then try to unmodify a currently modified note.
  if (modparts.root == note) {
    delete this.scaleMapByValue[
      this.music.getNoteValue(this.scaleMap[parts.root])];
    this.scaleMapByValue[this.music.getNoteValue(modparts.root)] =
      modparts.root;
    this.scaleMap[modparts.root] = modparts.root;
    return {
      "note": modparts.root,
      "accidental": null,
      "change": true
    }
  }

  // Last resort -- shitshoot
  delete this.scaleMapByValue[
    this.music.getNoteValue(this.scaleMap[parts.root])];
  this.scaleMapByValue[this.music.getNoteValue(note)] = note;

  delete this.scaleMap[modparts.root];
  this.scaleMap[modparts.root] = note;

  return {
    "note": note,
    "accidental": parts.accidental,
    "change": true
  }
}

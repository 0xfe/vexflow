import Vex from '../src/index.js';

const template = document.createElement('template');
template.innerHTML = `
`;

function concat(a, b) {
  return a.concat(b);
}

export class VFVoice extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode:'open' });
    this.shadowRoot.appendChild(document.importNode(template.content, true));

    // Defaults
    this.stem = 'up';
    this.autoBeam = false;

    this.notes = [];
    this.beams = [];
  }

  connectedCallback() {
    this.stem = this.getAttribute('stem') || this.stem;
    this.autoBeam = this.hasAttribute('autoBeam');
    this.notesText = this.textContent.trim();

    const getFactoryEvent = new CustomEvent('getFactory', { bubbles: true, detail: { factory: null } });
    this.dispatchEvent(getFactoryEvent);
    this.vf = getFactoryEvent.detail.factory;

    const getScoreEvent = new CustomEvent('getScore', { bubbles: true, detail: { score: null } });
    this.dispatchEvent(getScoreEvent);
    this.score = getScoreEvent.detail.score;

    const notes = this.createNotes();
    this.notes.push(notes);
    if (this.autoBeam) {
      this.beams.push(this.autoGenerateBeams(notes));
    }

    this.notes = this.notes.reduce(concat);
    if (this.beams.length > 0) {
      this.beams = this.beams.reduce(concat);
    }

    const notesAndBeamsCreatedEvent = new CustomEvent('notesCreated', { bubbles: true, detail: { notes: this.notes, beams: this.beams } });
    this.dispatchEvent(notesAndBeamsCreatedEvent);
  }

  createNotes() {
    this.score.set({ stem: this.stem });
    const staveNotes = this.score.notes(this.notesText);
    return staveNotes;
  }

  autoGenerateBeams(notes) {
    const beams = Vex.Flow.Beam.generateBeams(notes);
    beams.forEach( beam => {
      this.vf.renderQ.push(beam);
    })
    return beams;
  }
}

window.customElements.define('vf-voice', VFVoice);

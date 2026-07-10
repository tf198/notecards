

/* MIDI FUNCTIONS */

const ABC_NOTES = ['c', '^c', 'd', '^d', 'e', 'f', '^f', 'g', '^g', 'a', '^a', 'b'];
const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const VIOLIN_BASIC_FINGERING = [0, 2, 4, 5]; // High second fingers
const CELLO_BASIC_FINGERING = [0, 2, 3, 4, 5];

const VIOLIN_SHARP_FINGERING = ["0", "L1", "1", "L2", "H2", "3"];

function midi2abc(n) {
  // c = 60
  let note = n % 12;
  let octave = Math.floor(n / 12) - 6;
  var note_name = ABC_NOTES[note];
  var modifier = '';
  if (octave < 0) {
    note_name = note_name.toUpperCase();
    modifier = modifier.padEnd(Math.abs(octave)-1, ',');
  } else {
    console.log(octave);
    modifier = modifier.padEnd(octave, '\'');
  }
  return note_name + modifier;
}

function midi2note(n, octave) {
  let note = n % 12;
  if (!octave) return SHARP_NOTES[note];
  octave = Math.floor(n/12) - 1;
  return SHARP_NOTES[note] + octave;
}

/* Instrument Definitions */

class StringInstrument {

  constructor(lowestString=55, clef='treble', tuningInterval=7, stringCount=4) {
    this.lowestString = lowestString;
    this.clef = clef;
    this.tuningInterval = tuningInterval;
    this.stringCount = stringCount;
    this.strings = this.getStrings();
  }

  getStrings() {
    let result = [];
    for (let i=0; i<this.stringCount; i++) {
      result.push(this.lowestString + i * this.tuningInterval);
    }
    result.reverse();
    return result;
  }

  get games() {
    return {
      'Open Strings': this.openStringsGame.bind(this),
      'Open and Seconds': this.openAndSecondsGame.bind(this),
      'First and Thirds': this.firstAndThirdsGame.bind(this),
      'All Fingers': this.allFingers.bind(this),
    };
  }

  openStringsGame() {
    let game = [];
    for (let n of this.strings) {
      game.push([midi2note(n), midi2abc(n)]);
    }
    return game;
  }

  openAndSecondsGame() {
    let game = [];
    for (let n of this.strings) {
      game.push([midi2note(n)+'0', midi2abc(n)]);
    }
    for (let n of this.strings) {
      game.push([midi2note(n)+'2', midi2abc(n+4)]);
    }
    return game;
  }

  firstAndThirdsGame() {
    let game = [];
    for (let n of this.strings) {
      game.push([midi2note(n)+'1', midi2abc(n+2)]);
      game.push([midi2note(n)+'3', midi2abc(n+5)]);
    }
    return game;
  }

  allFingers() {
    let game = [];
    for (let f=0; f<4; f++) {
      for (let n of this.strings) {
        let label = f ? f : midi2note(n);
        game.push([label, midi2abc(n+VIOLIN_BASIC_FINGERING[f])])
      }
    }
    console.log(game);
    return game;
  }
  
  noteNames() {
    
  }

}

const INSTRUMENTS = {
  "Violin": new StringInstrument(55),
  "Viola": new StringInstrument(48, "alto"),
  "Cello": new StringInstrument(36, "bass")
}

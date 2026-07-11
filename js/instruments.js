

/* MIDI FUNCTIONS */

const ABC_NOTES = ['c', '^c', 'd', '^d', 'e', 'f', '^f', 'g', '^g', 'a', '^a', 'b'];

const NATURAL_NOTES = ['A', 'B', 'C','D', 'E', 'F', 'G'];
const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const TONIC = 0;
const SECOND = 2;
const MINOR_THIRD = 3;
const MAJOR_THIRD = 4;
const PERFECT_FOURTH = 5;
const PERFECT_FIFTH = 7;

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

class GameOptions {
  constructor(buttons, questions) {
    this.buttons = buttons || [];
    this.questions = questions || [];
  }

  addPair(note, button) {
    this.buttons.push(button);
    this.addSingle(note, button)
  }

  addSingle(note, button) {
    this.questions.push([note, button]);
  }

}

class StringInstrument {

  constructor(lowestString=55,
              clef='treble',
              tuningInterval=PERFECT_FIFTH,
              stringCount=4) {
    this.lowestString = lowestString;
    this.clef = clef;
    this.tuningInterval = tuningInterval;
    this.stringCount = stringCount;
    this.strings = this.getStrings();
    this.basicFingering = [TONIC, SECOND, MAJOR_THIRD, PERFECT_FOURTH];
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
      'Basic Fingers': this.allBasicFingers.bind(this),
      'Note Names': this.noteNames.bind(this),
    };
  }

  openStringsGame() {
    let game = new GameOptions();
    for (let n of this.strings) {
      game.addPair(midi2abc(n), midi2note(n));
    }
    return game;
  }


  allBasicFingers() {
    let game = new GameOptions();
    let c = this.basicFingering.length
    for (let f=0; f<c; f++) {
      for (let n of this.strings) {
        let label = f ? f : midi2note(n);
        game.addPair(midi2abc(n+this.basicFingering[f]), label);
      }
    }
    return game;
  }
  
  noteNames() {
    let game = new GameOptions(NATURAL_NOTES);
    for (let i=0; i< 25; i++) {
      let noteName = midi2note(this.lowestString+i);
      if (noteName.length == 1) {
        game.addSingle(midi2abc(this.lowestString+i), noteName);
      }
    }

    return game;
  }

}

class Violin extends StringInstrument {
  
  get games() {
    return {
      'Open Strings': this.openStringsGame.bind(this),
      'Open and Seconds': this.openAndSecondsGame.bind(this),
      'First and Thirds': this.firstAndThirdsGame.bind(this),
      'Basic Fingers': this.allBasicFingers.bind(this),
      'Note Names': this.noteNames.bind(this),
    };
  }

  openAndSecondsGame() {
    let game = new GameOptions();
    for (let n of this.strings) {
      game.addPair(midi2abc(n), midi2note(n));
    }
    for (let n of this.strings) {
      let note = midi2abc(n+4);
      game.addPair(note, "2");
    }
    return game;
  }

  firstAndThirdsGame() {
    let game = new GameOptions(['E', 'A', 'D', 'G']);
    for (let n of this.strings) {
      game.addPair(midi2abc(n+2), '1');
    }
    for (let n of this.strings) {
      game.addPair(midi2abc(n+5), '3');
    }
    return game;
  }

}

class Viola extends Violin {
  constructor() {
    super(48, "alto");
  }
}

class Cello extends StringInstrument {
  constructor() {
    super(36, "bass");
    this.basicFingering = [TONIC, SECOND, MINOR_THIRD, MAJOR_THIRD, PERFECT_FOURTH];
  }
}

const INSTRUMENTS = {
  "Violin": new Violin(),
  "Viola": new Viola(),
  "Cello": new Cello(),
};

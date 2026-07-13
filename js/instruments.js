

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
  constructor() {
    this.buttons = [];
    this.questions = [];
  }

  addButton(label, answer=null) {
    this.buttons.push([label, answer || label]);
  }

  addQuestion(note, answer=null) {
    this.questions.push([note, answer || note]);
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
      let label = midi2note(n);
      game.addButton(label);
      game.addQuestion(midi2abc(n), label);
    }
    return game;
  }


  allBasicFingers() {
    let game = new GameOptions();
    let c = this.basicFingering.length
    for (let f=0; f<c; f++) {
      for (let n of this.strings) {
        let note = midi2abc(n+this.basicFingering[f]);
        let label = f ? f : midi2note(n);
        game.addButton(label, note);
        game.addQuestion(note);
      }
    }
    return game;
  }
  
  noteNames() {
    let game = new GameOptions();
    NATURAL_NOTES.forEach((x) => game.addButton(x));
    for (let i=0; i< 25; i++) {
      let noteName = midi2note(this.lowestString+i);
      if (noteName.length == 1) {
        game.addQuestion(midi2abc(this.lowestString+i), noteName);
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
      //'High or Low?': this.highOrLowGame.bind(this),
      'Which String?': this.whichStringGame.bind(this),
      'Basic Fingers': this.allBasicFingers.bind(this),
      'Note Names': this.noteNames.bind(this),
    };
  }

  openAndSecondsGame() {
    let game = new GameOptions();
    for (let n of this.strings) {
      let note = midi2abc(n);
      game.addButton(midi2note(n), note);
      game.addQuestion(note);
    }
    for (let n of this.strings) {
      let interval = MAJOR_THIRD;
      if (midi2note(n+interval).length==2) interval = MINOR_THIRD;
      let note = midi2abc(n+interval);
      game.addButton("2", note);
      game.addQuestion(note);
    }
    return game;
  }

  firstAndThirdsGame() {
    let game = new GameOptions();
    this.strings.forEach((x) => game.addButton(midi2note(x)));
    for (let n of this.strings) {
      let interval = SECOND;
      if (midi2note(n+interval).length==2) interval--;
      let note = midi2abc(n+interval);
      game.addButton("1", note)
      game.addQuestion(note);
    }
    for (let n of this.strings) {
      let note = midi2abc(n+PERFECT_FOURTH);
      game.addButton("3", note)
      game.addQuestion(note);
    }
    return game;
  }

  whichStringGame() {
    let game = new GameOptions();
    for (let n of this.strings) {
      let string = midi2note(n);
      game.addButton(string);
      for (let i=0; i<6; i++) {
        if (midi2note(n+i).length == 1) {
          game.addQuestion(midi2abc(n+i), string);
        }
      }
    }
    return game;
  }

  highOrLowGame() {
    let game = new GameOptions();
    this.strings.forEach((n) => game.addButton(midi2note(n)));
    this.strings.forEach((n) => game.addButton("L2", midi2abc(n+MINOR_THIRD)));
    this.strings.forEach((n) => game.addButton("H2", midi2abc(n+MAJOR_THIRD)));
    let d = 62;
    ["F"].forEach(game.addQuestion);
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



function App() {

  let settings = JSON.parse(localStorage.getItem("settings"));
  if (settings == null) {
    settings = {
      gameLength: "30",
      instrumentName: "Violin"
    }
  }

  return {
    settings,

    get instrument() {
      return INSTRUMENTS[settings.instrumentName];
    },

    saveSettings() {
      localStorage.setItem("settings", JSON.stringify(this.settings));
    }

  }
}

function Game() {
  return {
    gameName: '',
    gameLength: 0,
    questions: [],
    buttonGroups: [],
    
    highscores: {},

    note: null,
    locked: false,
    score: 0,
    correct: 0,
    incorrect: 0,
    remaining: 0,
    message: '',
    timer: null,
    stats: {},

    init() {
      console.log("INIT");
      this.highscores = JSON.parse(localStorage.getItem('highscores'));
      if (this.highscores === null) this.highscores = {};
    },

    loadGame(instrument, gameName, gameLength) {
      this.gameName = gameName;
      this.gameLength = parseInt(gameLength);
      
      console.log("Loading " + gameName);
      game = instrument.games[gameName];
      
      if (!game) {
        this.send_message("Unknown game!");
        return;
      }

      if (typeof(game) == 'function') {
        game = game();
      }

      this.buttonGroups = this.button_groups(game.buttons);
      this.questions = game.questions;
    },

    startGame() {
      this.score = 0;
      this.correct = -1;
      this.incorrect = 0;
      this.stats = {};
      
      this.remaining = this.gameLength;
      this.locked = false;
      
      this.note = null;
      this.expected = null;
      
      Alpine.store('state', 'playing');

      window.clearInterval(this.timer);
      this.timer = window.setInterval(() => {
        this.remaining--;
        if (this.remaining == 5) this.send_message("Hurry up...");
        if (this.remaining <=0) {
          window.clearInterval(this.timer);
          this.remaining = 0;
          Alpine.store('state', 'results');
          this.note = null;

          this.score = this.score * 60 / this.gameLength;

          this.stats.correct = this.correct;
          this.stats.incorrect = this.incorrect;
          this.stats.accuracy = Math.ceil(this.correct * 100 / (this.correct+this.incorrect));
          this.stats.secondsPerCard = Math.round(10 * this.gameLength/this.correct) / 10;

          this.stats.message = this.resultMessage(this.score);

          if (this.score > this.highscore(this.gameName)) {
            this.stats.message = `Thats a new highscore!!!`;
            this.highscores[this.gameName] = this.score;
            localStorage.setItem('highscores', JSON.stringify(this.highscores));
          }

        }
      }, 1000);
      this.check(null);
    },

    resultMessage(score) {
      if (score > 60) return "Have you considered teaching?"
      if (score > 45) return "Wow, super impressive!";
      if (score > 30) return "Pretty good going";
      if (score > 15) return "Not bad - keep trying...";
      return "Have another go!";
    },

    button_groups(buttons) {
      let groups = []
      for (let i=0; i<buttons.length; i+=4) {
        groups.push(buttons.slice(i, i+4));
      }
      console.log(groups);
      return groups;
    },

    highscore(game) {
      return this.highscores[game] || 0;
    },

    send_message(m, unlock) {
      this.message = m;
      setTimeout(() => {
        this.message = '';
        if (unlock) {
          this.locked = false;
        }
      }, 1000);
    },

    check(note) {
      if (note != this.expected) {
        console.log("Wrong");
        this.locked = true;
        this.send_message("Oops - try again!", true);
        this.incorrect++;
        this.score = this.correct - this.incorrect;
        return;
      }

      this.correct++;
      this.score = this.correct - this.incorrect;
     
      let n = 0;
      while(true) {
        n = Math.floor(Math.random()*this.questions.length);
        if (this.questions[n][0] != this.note) break;
      }
      this.note = this.questions[n][0];
      this.expected = this.questions[n][1];
    }
  }
}

document.addEventListener('alpine:init', () => {
  Alpine.store('state', 'select');
});

document.addEventListener('DOMContentLoaded', () => {

  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Add a click event on each of them
  $navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {

      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');

    });
  });

});

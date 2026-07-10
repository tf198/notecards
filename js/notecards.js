

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
    note: null,
    buttons: [],
    buttonGroups: [],
    locked: false,
    score: 0,
    correct: 0,
    incorrect: 0,
    remaining: 0,
    gameLength: 0,
    message: '',
    timer: null,
    gameName: '',
    highscores: {},
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
      let game = instrument.games[gameName];
      if (!game) {
        this.send_message("Unknown game");
        return;
      }

      if (typeof(game) == 'function') {
        game = game();
      }

      this.buttons = game
      this.buttonGroups = this.button_groups(game);

    },

    startGame() {
      Alpine.store('state', 'playing');

      this.score = 0;
      this.stats = {};
      this.locked = false;
      this.correct = -1;
      this.note = null;
      this.incorrect = 0;
      this.remaining = this.gameLength;
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

          console.log(this.stats);

          if (this.score > this.highscore(this.gameName)) {
            this.stats.message = `New HighScore - ${this.score}!`;
            this.highscores[this.gameName] = this.score;
            localStorage.setItem('highscores', JSON.stringify(this.highscores));
          }

        }
      }, 1000);
      this.check(null);
    },

    resultMessage(score) {
      if (score > 45) return `Wow, ${score} is super impressive!`;
      if (score > 30) return `You scored ${score} - pretty good!`;
      if (score > 15) return `Not bad - keep trying`;
      return "Have another go!";
    },

    button_groups(buttons) {
      let groups = []
      for (let i=0; i<buttons.length; i+=4) {
        groups.push([buttons[i], buttons[i+1], buttons[i+2], buttons[i+3]])
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
      if (note != this.note) {
        console.log("Wrong");
        this.locked = true;
        this.send_message("Oops - try again!", true);
        this.incorrect++;
        this.score = this.correct - this.incorrect;
        return;
      }

      this.correct++;
      this.score = this.correct - this.incorrect;
      let n = Math.floor(Math.random()*this.buttons.length);
      if (this.buttons[n][1] == this.note) {
        n = (n + 1) % 3;
      }
      this.note = this.buttons[n][1];
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

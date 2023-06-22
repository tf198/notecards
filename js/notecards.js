
games = {
    'Open Strings':         [['G','g,,'], ['D','d,'], ['A','a,'], ['E','e']],
    'Opens and Seconds':    [['D-0', 'd,'], ['D-2', 'f,'], ['A-0', 'a,'], ['A-2', 'c']],
    'D String Fingers':     [['0', 'd,'], ['1', 'e,'], ['2','^f,'], ['3','g,']],
    'A String Fingers':     [['0', 'a,'], ['1', 'b,'], ['2','^c'], ['3','d']],
    'A and D Strings':      [['D-0', 'd,'], ['D-1', 'e,'], ['D-2', 'f,'], ['D-3', 'g,'], ['A-0', 'a,'], ['A-1', 'b,'], ['A-2', 'c'], ['A-3', 'd']] ,
}


function Game() {
    return {
        note: null,
        buttons: [],
        locked: false,
        score: 0,
        correct: 0,
        incorrect: 0,
        remaining: 0,
        message: '',
        timer: null,
        gameName: '',
        highscores: {},

        init() {
            console.log("INIT");
            this.highscores = JSON.parse(localStorage.getItem('highscores'));
            if (this.highscores === null) this.highscores = {};
        },
        
        start(game) {
            console.log("Starting " + game);
            if (!games[game]) {
                this.send_message("Unknown game");
                return;
            }
            this.gameName = game;
            console.log("GAME", this.gameName);
            Alpine.store('state', 'playing');

            this.buttons = games[game];
            this.score = 0;
            this.locked = false;
            this.correct = -1;
            this.note = null;
            this.incorrect = 0;
            this.remaining = 30;
            this.timer = window.setInterval(() => {
                this.remaining--;
                if (this.remaining == 5) this.send_message("Hurry up...");
                if (this.remaining <=0) {
                    window.clearInterval(this.timer);
                    this.remaining = 0;
                    Alpine.store('state', 'results');
                    this.note = null;
                    this.send_message("Game over - you scored " + this.score);
                    if (this.score > this.highscore(game)) {
                        this.send_message("New HighScore!");
                        this.highscores[game] = this.score;
                        localStorage.setItem('highscores', JSON.stringify(this.highscores));
                    }
                }
            }, 1000);
            this.check(null);
        },

        highscore(game) {
            return this.highscores[game];
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
                this.send_message("Try again...", true);
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
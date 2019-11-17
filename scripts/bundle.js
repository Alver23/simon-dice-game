const blue = document.getElementById('blue');
const violet = document.getElementById('violet');
const orange = document.getElementById('orange');
const green = document.getElementById('green');
const buttonStartGame = document.getElementById('start-game');
const level = document.getElementById('level');
const countdown = document.getElementById('countdown');
const lifes = document.getElementById('lifes');
const LAST_LEVEL = 10;
const LIFES = 3;
const TIMER = 15;
const START_LEVEL = 1;

const CONFIG = {
    buttonStartGame,
    lastLevel: LAST_LEVEL,
    lifes: LIFES,
    timer: TIMER,
    startLevel: START_LEVEL,
    elements: {
        info: {
            level,
            countdown,
            lifes,
        },
        colors: {
            blue,
            violet,
            orange,
            green,
        },
    },
}
const clickZound = zounds.load('./sounds/click.wav');

level.innerHTML = `<strong>Nivel: </strong>${START_LEVEL}`;
countdown.innerHTML = `<strong>Tiempo: </strong>${TIMER} s`;
lifes.innerHTML = `<strong>Vidas: </strong>${LIFES}`;


class Game {
    lifes;
    timer;
    level;
    colors;
    buttonStartGame;
    infoElements;
    lastLevel;
    constructor(config) {
        this.config = config;
        this.initialize();
        this.generateSequence();
        setTimeout(this.nextLevel, 500);
    }

    initialize() {
        this.setConfig();
        this.nextLevel = this.nextLevel.bind(this);
        this.colorClicked = this.colorClicked.bind(this);
        this.addClassToElement(this.buttonStartGame, 'hide');
        this.addTextToElement(this.infoElements.level, 'Nivel', this.level);
        this.addTextToElement(this.infoElements.lifes, 'Vidas', this.lifes);
    }

    setConfig() {
        ({
            lifes: this.lifes,
            timer: this.timer,
            startLevel: this.level,
            buttonStartGame: this.buttonStartGame,
            lastLevel: this.lastLevel,
        } = { ...this.config});
        this.currentLifes = this.lifes;
        const { elements: { info, colors } } = { ...this.config};
        this.infoElements = info;
        this.colors = colors;
    }

    addClassToElement(element, className) {
        element.classList.add(className);
    }

    removeClassToElement(element, className) {
        element.classList.remove(className);
    }

    generateSequence() {
        this.sequence = new Array(this.lastLevel)
            .fill(0)
            .map(() => Math.floor(Math.random() * 4));
    }

    nextLevel() {
        this.subLevel = 0;
        this.iluminateSecuence();
        this.addEventClicks();
    }

    iluminateSecuence() {
        for (let i = 0; i < this.level; i++) {
            const time = 1000 * i
            this.startTimer(time);
            setTimeout(() => {
                this.iluminateColor(this.getColorNameByIndex(this.sequence[i]));
            }, time)
        }
    }

    getColorNameByIndex(index) {
        switch (index) {
            case 0:
                return 'blue';
            case 1:
                return 'violet';
            case 2:
                return 'orange';
            case 3:
                return 'green';
        }
    }

    getColorIndexByName(name) {
        switch (name) {
            case 'blue':
                return 0;
            case 'violet':
                return 1;
            case 'orange':
                return 2;
            case 'green':
                return 3;
        }
    }

    iluminateColor(color) {
        const element = this.colors[color];
        const className = `bg-${color}--light`;
        this.addClassToElement(element, className);
        clickZound.play();
        setTimeout(() => this.removeClassToElement(element, className), 400);
    }

    addEventClicks() {
        for (const key in this.colors) {
            this.colors[key].addEventListener('click', this.colorClicked)
        }
    }

    removeEventClicks() {
        for (const key in this.colors) {
            this.colors[key].removeEventListener('click', this.colorClicked)
        }
    }

    colorClicked(ev) {
        const color = ev.target.dataset.color;
        const index = this.getColorIndexByName(color);
        this.iluminateColor(color);
        if (index === this.sequence[this.subLevel]) {
            this.subLevel++;
            this.isSameLevel();
        } else {
            this.isGameLost();
        }
    }

    isGameLost() {
        this.currentLifes--;
        if (this.validateLife()) {
            this.addTextToElement(this.infoElements.lifes, 'Vidas', this.currentLifes);
            this.stopTimer();
            this.continueGame();
        } else {
            this.gameLost();
        }
    }

    isSameLevel() {
        if (this.subLevel === this.level) {
            this.level++;
            this.removeEventClicks();
            this.isLastLevel();
        }
    }

    isLastLevel() {
        if (this.level === (this.lastLevel + 1)) {
            this.gameWon();
        } else {
            setTimeout(() => {
                this.addTextToElement(this.infoElements.level, 'Nivel', this.level);
                this.stopTimer();
                this.nextLevel();
            }, 1000);
        }
    }

    validateLife() {
        return (this.currentLifes <= this.lifes && this.currentLifes > 0) || false;
    }

    addTextToElement(element, title, text) {
        element.innerHTML = `<strong>${title}: </strong>${text}`;
    }

    startTimer(time) {
        time = time === 0 ? 1000 : time;
        this.stopTimer();
        this.countDown = setInterval(() => {
            this.addTextToElement(this.infoElements.countdown, 'Tiempo', `${this.timer} s`);
            if (this.timer === 0) {
                this.stopTimer();
                this.isGameLost();
            }
            this.timer--;
        }, time);
    }

    stopTimer() {
        this.timer = this.config.timer;
        this.addTextToElement(this.infoElements.countdown, 'Tiempo', `${this.timer} s`);
        clearInterval(this.countDown);
    }

    gameWon() {
        this.stopTimer();
        Swal.fire({
            title:'Platzi',
            text: 'Felicitaciones, ganaste el juego :)',
            icon: 'success',
        }).then(() => this.removeClassToElement(this.buttonStartGame, 'hide'))
    }

    gameLost() {
        this.stopTimer();
        Swal.fire({
            title:'Platzi',
            text: 'Lo lamentamos, perdiste :(',
            icon: 'error',
        })
            .then(() => {
                this.removeEventClicks();
                this.removeClassToElement(this.buttonStartGame, 'hide')
            })
    }

    continueGame() {
        const text = this.currentLifes === 1 ? `Te queda 1 vida`: `Te quedan ${this.currentLifes} vidas`;
        Swal.fire({
            title:'Platzi',
            text,
            icon: 'warning',
        }).then(() => {
            this.removeEventClicks();
            setTimeout(() => {
                this.stopTimer();
                this.nextLevel();
            }, 1000);
        })
    }


}

function startGame() {
    new Game(CONFIG);
}

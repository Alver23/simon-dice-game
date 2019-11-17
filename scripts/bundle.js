const blue = document.getElementById('blue');
const violet = document.getElementById('violet');
const orange = document.getElementById('orange');
const green = document.getElementById('green');
const buttonStartGame = document.getElementById('start-game');
const level = document.getElementById('level');
const countdown = document.getElementById('countdown');
const lifes = document.getElementById('lifes');
const points = document.getElementById('points');
const LAST_LEVEL = 10;
const LIFES = 3;
const TIMER = 20;
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
            points,
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
    constructor(config, player) {
        this.config = config;
        this.playerName = player;
        this.player = new Player();
        this.initialize();
        this.generateSequence();
        setTimeout(this.nextLevel, 500);
    }

    initialize() {
        this.setConfig();
        this.nextLevel = this.nextLevel.bind(this);
        this.colorClicked = this.colorClicked.bind(this);
        this.addEventClicks = this.addEventClicks.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.addClassToElement(this.buttonStartGame, 'hide');
        this.addTextToElement(this.infoElements.level, 'Nivel', this.level);
        this.addTextToElement(this.infoElements.lifes, 'Vidas', this.lifes);
        this.setPoints();
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
        this.points = 0;
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
    }

    iluminateSecuence() {
        let count = 0;
        for (let i = 0; i < this.level; i++) {
            const time = 1000 * i
            setTimeout(() => {
                this.iluminateColor(this.getColorNameByIndex(this.sequence[i]));
            }, time);
            count = i;
        }
        const timer = count * 1000;
        setTimeout(this.startTimer, timer);
        setTimeout(this.addEventClicks, timer + 1000)
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
            this.setPoints();
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

    startTimer() {
        this.stopTimer();
        this.countDown = setInterval(() => {
            this.addTextToElement(this.infoElements.countdown, 'Tiempo', `${this.timer} s`);
            if (this.timer === 0) {
                this.stopTimer();
                this.isGameLost();
            }
            this.timer--;
        }, 1000);
    }

    stopTimer() {
        this.timer = this.config.timer;
        this.addTextToElement(this.infoElements.countdown, 'Tiempo', `${this.timer} s`);
        clearInterval(this.countDown);
    }

    gameWon() {
        this.stopTimer();
        this.savePlayer();
        Swal.fire({
            title:'Platzi',
            text: 'Felicitaciones, ganaste el juego :)',
            icon: 'success',
        }).then(() => {
            this.removeClassToElement(this.buttonStartGame, 'hide')
            this.player.lists();
        })
    }

    gameLost() {
        this.stopTimer();
        this.savePlayer();
        Swal.fire({
            title:'Platzi',
            text: 'Lo lamentamos, perdiste :(',
            icon: 'error',
        })
            .then(() => {
                this.removeEventClicks();
                this.removeClassToElement(this.buttonStartGame, 'hide');
                this.player.lists()
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

    setPoints() {
        this.points = this.level * 100;
        this.addTextToElement(this.infoElements.points, 'Puntos', this.points);
    }

    savePlayer() {
        this.player.save(this.playerName, this.points);
    }
}

class Player {
    constructor() {
        this.table = document.getElementById('js-game-points');
        this.localStorage = new LocalStorage();
    }

    lists() {
        const tbody = this.table.getElementsByTagName('tbody')[0];
        const data = this.localStorage.getData();
        if (data  && data.length > 0) {
            const elements = data.map((item) => {
                return `<tr>
                    <td>${item.name}</td>
                    <td>${item.points}</td>
                </tr>`;
            });
            tbody.innerHTML = elements.join(' ');
            this.table.classList.remove('d-none')
        }

    }

    save(name, points) {
        this.localStorage.setData(name, points);
    }
}

class LocalStorage {
    constructor() {
        this.item = 'best_results'
        this.localStorage = window.localStorage;
    }

    setData(name, points) {
        const currentData = this.getData() || [];
        const data = [
            ...currentData,
            {
                name,
                points,
            }
        ];
        this.localStorage.setItem(this.item, JSON.stringify(data));
    }

    getData() {
        let data = this.localStorage.getItem(this.item);
        data = JSON.parse(data);
        if (data && data.length > 0) {
            data.sort((a, b) => {
                if (a.points < b.points) {
                    return 1;
                }
                if (a.points > b.points) {
                    return -1;
                }
                return 0;

            })
            data = data.slice(0, 3);
        }
        return data;
    }
}

async function startGame() {
    const { value: name } = await Swal.fire({
        title: 'Ingrese su nombre',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Necesitas escribir algo!'
            }
        }
    });
    name && (window.game = new Game(CONFIG, name));
}

const player = new Player();

player.lists();

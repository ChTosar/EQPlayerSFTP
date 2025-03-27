export class SpeedControls {
    static #instance = null;
    #audio;
    #playButton;
    #nextButton;
    #prevButton;
    #progressCanvas;
    #actualSpeed = 1.0;
    #lastAction = 0;
    #increment = 1.0;
    #maxSpeed = 5.0;
    #timeThreshold = 250;
    #interval;
    #stopInterval;
    #backTimeSpeed = -1.0;

    constructor() {
        if (SpeedControls.#instance) {
            return SpeedControls.#instance;
        }
        SpeedControls.#instance = this;

        this.#audio = document.querySelector('audio');
        this.#playButton = document.getElementById("play");
        this.#nextButton = document.getElementById("next");
        this.#prevButton = document.getElementById("prev");
        this.#progressCanvas = document.getElementById("progressCanvas");

        this.#setupEventListeners();
    }

    play(force) {
        this.#audio.playbackRate = 1;
        if (this.#audio.paused || force) {
            this.#audio.play();
            this.#playButton.innerHTML = "&#xe802;";
        } else {
            this.#audio.pause();
            this.#playButton.innerHTML = "&#xe801;";
        }
    }

    #updateSpeed() {
        const now = Date.now();
        const tiempoDesdeUltimaAccion = now - this.#lastAction;
        this.#actualSpeed = tiempoDesdeUltimaAccion <= this.#timeThreshold
            ? Math.min(this.#actualSpeed + this.#increment, this.#maxSpeed)
            : 2.0;
        this.#audio.playbackRate = this.#actualSpeed;
        this.#lastAction = now;
    }

    startAcceleration() {
        this.#updateSpeed();
        this.#audio.playbackRate = Math.min(this.#audio.playbackRate + this.#increment, this.#maxSpeed);
    }

    stopAcceleration() {
        clearInterval(this.#interval);
        clearInterval(this.#stopInterval);
        this.#stopInterval = setTimeout(() => {
            if (Date.now() - this.#lastAction > this.#timeThreshold) {
                if (this.#actualSpeed == 2.0) {
                    window.fileList.playNextSong();
                } else {
                    this.#audio.playbackRate = 1.0;
                    this.#actualSpeed = 1.0;
                }
            }
        }, this.#timeThreshold);
    }

    startBackspace() {
        this.#backTimeSpeed = -2.0;
        this.#interval = setInterval(() => {
            this.#audio.currentTime = Math.max(this.#audio.currentTime + this.#backTimeSpeed, 0);
        }, this.#timeThreshold);
    }

    stopBackspace() {
        clearInterval(this.#interval);
        clearInterval(this.#stopInterval);

        this.#stopInterval = setTimeout(() => {
            if (Date.now() - this.#lastAction > this.#timeThreshold) {
                if (this.#backTimeSpeed == 2.0) {
                    window.fileList.playPrevSong();
                } else {
                    this.#backTimeSpeed = -1.0;
                }
            }
        }, this.#timeThreshold);
    }

    #setupEventListeners() {
        this.#playButton.addEventListener("click", () => this.play());
        this.#nextButton.addEventListener("mousedown", () => this.startAcceleration());
        this.#nextButton.addEventListener("mouseup", () => this.stopAcceleration());
        this.#prevButton.addEventListener("mousedown", () => this.startBackspace());
        this.#prevButton.addEventListener("mouseup", () => this.stopBackspace());

        this.#progressCanvas.addEventListener("click", (event) => {
            const positionX = event.offsetX;
            const total = this.#progressCanvas.clientWidth;
            const position = positionX / total;
            if (this.#audio.readyState >= 2) {
                this.#audio.currentTime = this.#audio.duration * position;
            } else {
                this.#audio.addEventListener("loadedmetadata", () => {
                    this.#audio.currentTime = this.#audio.duration * position;
                });
            }
        });

        this.#audio.addEventListener("ended", () => {
            window.fileList.playNextSong();            
        });
    }
}
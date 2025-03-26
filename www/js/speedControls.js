export class SpeedControls {
    static #instance = null;
    #audio;
    #playButton;
    #nextButton;
    #prevButton;
    #progressCanvas;
    #velocidadActual = 1.0;
    #tiempoUltimaAccion = 0;
    #incremento = 1.0;
    #velocidadMaxima = 5.0;
    #umbralTiempo = 250;
    #intervalo;
    #velocidadRetroceso = -1.0;

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

    #actualizarVelocidad() {
        const ahora = Date.now();
        const tiempoDesdeUltimaAccion = ahora - this.#tiempoUltimaAccion;
        this.#velocidadActual = tiempoDesdeUltimaAccion <= this.#umbralTiempo
            ? Math.min(this.#velocidadActual + this.#incremento, this.#velocidadMaxima)
            : 2.0;
        this.#audio.playbackRate = this.#velocidadActual;
        this.#tiempoUltimaAccion = ahora;
    }

    iniciarAceleracion() {
        this.#actualizarVelocidad();
        this.#audio.playbackRate = Math.min(this.#audio.playbackRate + this.#incremento, this.#velocidadMaxima);
    }

    detenerAceleracion() {
        clearInterval(this.#intervalo);
        setTimeout(() => {
            if (Date.now() - this.#tiempoUltimaAccion > this.#umbralTiempo) {
                this.#audio.playbackRate = 1.0;
                this.#velocidadActual = 1.0;
            }
        }, this.#umbralTiempo);
    }

    iniciarRetroceso() {
        this.#velocidadRetroceso = -2.0;
        this.#intervalo = setInterval(() => {
            this.#audio.currentTime = Math.max(this.#audio.currentTime + this.#velocidadRetroceso, 0);
        }, this.#umbralTiempo);
    }

    detenerRetroceso() {
        clearInterval(this.#intervalo);
        setTimeout(() => {
            if (Date.now() - this.#tiempoUltimaAccion > this.#umbralTiempo) {
                this.#velocidadRetroceso = -1.0;
            }
        }, this.#umbralTiempo);
    }

    #setupEventListeners() {
        this.#playButton.addEventListener("click", () => this.play());
        this.#nextButton.addEventListener("mousedown", () => this.iniciarAceleracion());
        this.#nextButton.addEventListener("mouseup", () => this.detenerAceleracion());
        this.#prevButton.addEventListener("mousedown", () => this.iniciarRetroceso());
        this.#prevButton.addEventListener("mouseup", () => this.detenerRetroceso());

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
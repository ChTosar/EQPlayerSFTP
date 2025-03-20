import "segment-display";
import "classic-equalizer";
import { SFTP } from './sftp.js';

window.onload = () => {

    const segmentDisplay = document.querySelector('segment-display');
    const equalizer = document.querySelector('classic-equalizer');
    const audio = document.querySelector('audio');
    const progressCanvas = document.getElementById("progressCanvas");

    const margin = 3;   // Margen entre los píxeles
    const pixelSize = 8; // Tamaño de cada bloque cuadrado
    progressCanvas.width = progressCanvas.offsetWidth;
    progressCanvas.height = 5;

    segmentDisplay.segment.SegmentWidth = 0.07;
    segmentDisplay.segment.BevelWidth = 0.9;

    segmentDisplay.segment.BevelWidth = 0.9;

    segmentDisplay.segment.Padding = 3;

    segmentDisplay.segment.SegmentInterval = 0.05;
    segmentDisplay.segment.SideBevelEnabled = false;

    equalizer.setAttribute('height', 280);
    equalizer.setAttribute('rows', 26);

    function drawProgress() {
        const ctx = progressCanvas.getContext("2d");
        const totalPixels = Math.floor(progressCanvas.width / (pixelSize + margin));
        const progress = audio.currentTime / audio.duration;
        const filledPixels = Math.floor(progress * totalPixels);

        ctx.clearRect(0, 0, progressCanvas.width, progressCanvas.height);

        for (let i = 0; i < totalPixels; i++) {
            ctx.fillStyle = i < filledPixels ? window.themeColors.whtie : window.themeColors.bgLeds;
            ctx.fillRect(i * (pixelSize + margin), 0, pixelSize, progressCanvas.height);
        }

        if (filledPixels > 0) {
            ctx.fillStyle = window.themeColors.mainColor;
            ctx.fillRect((filledPixels - 1) * (pixelSize + margin), 0, pixelSize, progressCanvas.height);
        }

        requestAnimationFrame(drawProgress);
    }

    window.speedControls = new SpeedControls();
    window.fileList = new FileList();
    window.settings = new Settings();
    window.SFTP = new SFTP();
    drawProgress();
    sftpConfig();

    setTimeout(() => {
        window.scrollTo({top:0});
    }, 0);
};

function sftpConfig() {

    document.getElementById('url').value = window.SFTP.host;
    document.getElementById('port').value = window.SFTP.port;
    document.getElementById('username').value = window.SFTP.username;
    document.getElementById('path').value = window.SFTP.path;

    document.getElementById('sshConfig').addEventListener('click', () => {

        window.SFTP.setConfig(
            document.getElementById('url').value, 
            document.getElementById('port').value, 
            document.getElementById('username').value, 
            document.getElementById('password').value, 
            document.getElementById('path').value
        );
    });
}

class Settings {
    static #instance = null;
    #settings;
    #colorSelect;
    #primaryColor;
    #bgColor;
    #white;

    constructor() {
        if (Settings.#instance) {
            return Settings.#instance;
        }
        Settings.#instance = this;

        this.#settings = document.getElementById('settings');
        this.#colorSelect = document.getElementById('colorSelect');
        this.#primaryColor = document.getElementById('primaryColor');
        this.#bgColor = document.getElementById('bgColor');
        this.#white = document.getElementById('lighrColor');

        this.getColors();
        this.setColors();
        this.#setupEventListeners();
    }

    #setupEventListeners() {
        this.#settings.addEventListener('click', () => {
            const slideController = document.querySelector('.slideController');
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            slideController.scrollTo({ left: slideController.scrollLeft === 0 ? 250 : 0, behavior: 'smooth' });
            this.resetMenu();
        });

        this.#colorSelect.addEventListener('change', (event) => {
            document.querySelector('.customColors.hidden').style.display = 'none';

            switch (event.target.value) {
                case "red":
                    window.themeColors.mainColor = "#ff2540";
                    window.themeColors.bgLeds = "#222222";
                    window.themeColors.white = "#ffffff";
                    break;
                case "green":
                    window.themeColors.mainColor = "#65f06a";
                    window.themeColors.bgLeds = "#222222";
                    window.themeColors.white = "#ffffff";
                    break;
                case "blue":
                    window.themeColors.mainColor = "#2087ff";
                    window.themeColors.bgLeds = "#222222";
                    window.themeColors.white = "#ffffff";
                    break;
                case "custom":
                    document.querySelector('.customColors.hidden').style.display = 'block';

                    this.#primaryColor.value = window.themeColors.mainColor;
                    this.#bgColor.value = window.themeColors.bgLeds;
                    this.#white.value = window.themeColors.white;
                    break;
            }
            this.saveColors();
            this.setColors();
        });

        this.#primaryColor.addEventListener('change', (event) => {
            window.themeColors.mainColor = event.target.value;
            this.setColors();
        });

        this.#bgColor.addEventListener('change', (event) => {
            window.themeColors.bgLeds = event.target.value;
            this.setColors();
        });

        this.#white.addEventListener('change', (event) => {
            window.themeColors.white = event.target.value;
            this.setColors();
        });

        const menus = [{name:"theme", position:"54"}, {name:"ssh", position:"21"}, {name:"about", position:"-14"}];

        menus.forEach(menu => {
            const othersMenus = menus.filter(item => item.name !== menu.name);
            document.querySelector(`.settings .menu.${menu.name}`).addEventListener('click', () => {

                if (document.querySelector('.settings .bg').style.transform === '') {
                    setTimeout(() => {
                        document.querySelector('.settings .bg').style.transform = `translateY(calc(-50% + ${menu.position}px))`;
                        document.querySelector(`.form.${menu.name}`).style.display = "block";
                    }, 400);
                    othersMenus.forEach(menu => {
                        document.querySelector(`.settings .menu.${menu.name}`).style.opacity = 0;
                    });
                } else {
                    this.resetMenu();
                }
            });
        });
    }

    resetMenu() {
        document.querySelector('.settings .bg').style.transform = '';

        document.querySelectorAll(`.form`).forEach((element) => {
            element.style.display = '';
        });
        document.querySelectorAll(`.settings .menu`).forEach((element) => {
            element.style.opacity = '';
        });
    }

    setColors() {
        const segmentDisplay = document.querySelector('segment-display');
        const equalizer = document.querySelector('classic-equalizer');
        const audio = document.querySelector('audio');
        equalizer.setAttribute('colors', JSON.stringify({
            barBgColor: window.themeColors.bgLeds,
            barColor: window.themeColors.whtie,
            barColor2: window.themeColors.bgLeds,
            barColor3: window.themeColors.mainColor
        }));
    
        segmentDisplay.segment.FillLight = window.themeColors.mainColor;
        segmentDisplay.segment.FillDark = window.themeColors.bgLeds;
        segmentDisplay.segment.colorDark = window.themeColors.mainColor;
        segmentDisplay.segment.colorLight = window.themeColors.mainColor;
        segmentDisplay.segment.strokeLight = window.themeColors.mainColor;
        segmentDisplay.segment.strokeDark = window.themeColors.mainColor;
    
        document.querySelector('body').style.setProperty('--main-color', window.themeColors.mainColor);
        segmentDisplay.setAttribute('text', audio.getAttribute('src'));
    }

    saveColors() {
        localStorage.setItem('themeColors', JSON.stringify(window.themeColors));
    }

    getColors() {
        const themeColors = localStorage.getItem('themeColors');

        if (themeColors) {
            window.themeColors = JSON.parse(themeColors);
        } else {
            window.themeColors = {};
            window.themeColors.whtie = '#d7f0ff';
            window.themeColors.mainColor = '#ff2540';
            window.themeColors.bgLeds = '#222222';
        }
    }
}

class FileList {
    static #instance = null;
    #listButton;
    #remoteList;
    #localList;
    #audio;
    #segmentDisplay;
    #items = [];
    #localItems = [];
    #lastCheck;

    constructor() {
        if (FileList.#instance) {
            return FileList.#instance;
        }
        FileList.#instance = this;

        this.#listButton = document.getElementById("list");
        this.#remoteList = document.querySelector(".list ul.remoteList");
        this.#localList = document.querySelector(".list ul.localList");
        this.#audio = document.querySelector("audio");
        this.#segmentDisplay = document.querySelector("segment-display");

        this.#setupEventListeners();
    }

    async updateList() {
        const now = new Date().getTime();

        if (this.#items.length === 0 || !this.#lastCheck || this.#lastCheck - now > 600000) {
            this.#items = await window.SFTP.listDirectory();
            this.#items = this.#items.filter(item => (item.isDir && !item.name.startsWith('.')) || item.name.endsWith(".mp3"));
            this.#lastCheck = now;
        }
    }

    async localList() {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (fileSystem) => {        
                let reader = fileSystem.createReader();
                reader.readEntries((entries) => {
                    this.#localItems = entries.filter(item => (item.isDir && !item.name.startsWith('.')) || item.name.endsWith(".mp3"));
                    resolve(this.#localItems);
                  },
                  (err) => {
                    console.log(err);
                    reject(err);
                  }
                );
            
            }, (error) => {
                console.error(error);
            });
        });
    }

    async #drawLocalItems() {
        this.#localList.innerHTML = '';

        this.#localItems.forEach(item => {
            const li = document.createElement('li');

            if (item.isDir) {
                li.innerText = `/${item.name}`
            } else {
                const nameDivided = item.name.split('.');
                const extension = nameDivided.pop();
                li.file = {
                    filepath: item.filepath,
                    name: item.name
                };
                li.innerHTML = `${nameDivided}<div class='badge'>${extension}<div>`;
            }

            this.#localList.appendChild(li);

            li.addEventListener("click", async (event) => {
                const fileName = event.target.file.name;
                try {
                    await this.#attachToplayer(fileName);
                } catch (err) {
                    await window.SFTP.download(fileName);
                    await this.#attachToplayer(fileName);
                }
            });
        });

    }

    async #drawItems() {
        this.#remoteList.innerHTML = '';

        this.#items.forEach(item => {
            const li = document.createElement('li');

            if (item.isDir) {
                li.innerText = `/${item.name}`
            } else {
                const nameDivided = item.name.split('.');
                const extension = nameDivided.pop();
                li.file = {
                    filepath: item.filepath,
                    name: item.name
                };
                li.innerHTML = `${nameDivided}<div class='badge'>${extension}<div>`;
            }

            this.#remoteList.appendChild(li);

            li.addEventListener("click", async (event) => {
                const fileName = event.target.file.name;
                try {
                    await this.#attachToplayer(fileName);
                } catch (err) {
                    await window.SFTP.download(fileName);
                    await this.#attachToplayer(fileName);
                }
            });
        });
    }

    async #setupEventListeners() {

        const localButton = document.querySelector(".localButton");
        const remoteButton = document.querySelector(".remoteButton");
        const localList = document.querySelector(".localList");
        const remoteList = document.querySelector(".remoteList");

        localButton.addEventListener("click", () => {
            localButton.classList.add("selected");
            localList.classList.add("selected");

            remoteButton.classList.remove("selected");
            remoteList.classList.remove("selected");
        });

        remoteButton.addEventListener("click", () => {
            remoteButton.classList.add("selected");
            remoteList.classList.add("selected");

            localButton.classList.remove("selected");
            localList.classList.remove("selected");
        });

        this.#listButton.addEventListener("click", async () => {
            const progressCanvas = document.getElementById("progressCanvas");
            window.scrollTo({
                top: window.scrollY === 0 ? progressCanvas.offsetTop : 0,
                left: 0,
                behavior: 'smooth'
            });
            await this.updateList();
            await this.localList();
            this.#drawLocalItems();
            this.#drawItems();
        });
    }

    #attachToplayer(fileName) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(`${cordova.file.dataDirectory}/${fileName}`, (fileEntry) => {
                this.#audio.src = fileEntry.toNativeURL();
                this.#segmentDisplay.setAttribute('text', fileName);
                window.speedControls.play(true);
                resolve();
            }, (error) => {
                console.error(error);
                reject(error);
            });
        });
    }
}

class SpeedControls {
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
    }
}

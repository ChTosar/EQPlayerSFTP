export class Settings {
    static #instance = null;
    #settings;
    #colorSelect;
    #primaryColor;
    #bgColor;
    #white;
    #statusbar;
    #moreInfo;

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
        this.#statusbar = document.getElementById('statusBar');
        this.#moreInfo = document.querySelector('.about .moreInfo');

        this.getConfig();
        this.setConfig();

        this.#setupEventListeners();
    }

    settingToggle(close) {

        const slideController = document.querySelector('.slideController');
        close = close ? close : slideController.scrollLeft !== 0;

        if (close) {
            slideController.scrollTo({ left:  0, behavior: 'smooth' });
            this.resetMenu();
        } else {
            slideController.scrollTo({ left:  250, behavior: 'smooth' });
            window.fileList.listToggle(true);
        }
    }

    #setupEventListeners() {

        this.#settings.addEventListener('click', () => {
            this.settingToggle();
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

        this.#moreInfo.addEventListener('click', (event) => {
            const data = document.querySelector('pre.data');
            data.innerHTML=
            `width: ${window.screen.width}
height: ${window.screen.height}
pixelRatio: ${window.devicePixelRatio}`;
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

        this.#statusbar.addEventListener('click', (event) => {
            if(event.target.checked) {
                StatusBar.show();
                window.config.statusBar = true;
            } else {
                StatusBar.hide();
                window.config.statusBar = false;
            }
            this.saveConfig();
        });

        (() => {
            const equalizer = document.querySelector('classic-equalizer');
            let touchStartX = 0;
            let touchEndX = 0;
        
            equalizer.addEventListener("touchstart", (event) => {
                touchStartX = event.touches[0].clientX;
            });
        
            equalizer.addEventListener("touchend", (event) => {
                touchEndX = event.changedTouches[0].clientX;
                handleSwipe();
            });
        
            const handleSwipe = () => {
                const swipeThreshold = 40;
                if ( touchEndX - touchStartX > swipeThreshold) {
                    this.settingToggle(true);
                }
            }
        })();

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

    saveConfig() {
        localStorage.setItem('config', JSON.stringify(window.config));
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

    getConfig() {
        const config = localStorage.getItem('config');

        if (config) {
            window.config = JSON.parse(config);
        } else {
            window.config = {};
            window.config.statusBar = true;
        }

        this.getColors();
    }

    setConfig() {
        if (window.cordova && window.StatusBar) {
            if (window.config.statusBar == true) {
                this.#statusbar.checked = true;
                StatusBar.show();
            } else {
                this.#statusbar.checked = false;
                StatusBar.hide();
            }
        }
        this.setColors();
    }
}
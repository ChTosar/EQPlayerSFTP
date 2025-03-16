import "segment-display";
import "classic-equalizer";

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

    window.themeColors = {};
    window.themeColors.whtie = '#d7f0ff';
    window.themeColors.mainColor = '#ff2540';
    window.themeColors.bgLeds = '#222222';

    setColors();
    
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

    drawProgress();
    speedControls();
    list();
    settings();
};

function setColors() {

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
    segmentDisplay.segment.colorDark  = window.themeColors.mainColor;
    segmentDisplay.segment.colorLight = window.themeColors.mainColor;
    segmentDisplay.segment.strokeLight = window.themeColors.mainColor;
    segmentDisplay.segment.strokeDark = window.themeColors.mainColor;

    document.querySelector('body').style.setProperty('--main-color', window.themeColors.mainColor);
    segmentDisplay.setAttribute('text', audio.getAttribute('src'));
}

function settings() {

    const settings = document.getElementById('settings');
    const colorSelect = document.getElementById('colorSelect');
    const primaryColor = document.getElementById('primaryColor');
    const bgColor = document.getElementById('bgColor');
    const whtie = document.getElementById('lighrColor');

    settings.addEventListener('click', () => {        
        const slideController = document.querySelector('.slideController');
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
        slideController.scrollTo({left: slideController.scrollLeft == 0 ? 250 : 0, behavior: 'smooth'});
    });

    colorSelect.addEventListener('change', (event) => {
        
        document.querySelector('.customColors.hidden').style.display = 'none';

        switch(event.target.value) {
            case "red":
                window.themeColors.mainColor = "#ff2540";
                window.themeColors.bgLeds = "#222222";
                window.themeColors.whtie = "#ffffff";
                break;
            case "green":
                window.themeColors.mainColor = "#65f06a";
                window.themeColors.bgLeds = "#222222";
                window.themeColors.whtie = "#ffffff";
                break;
            case "blue":
                window.themeColors.mainColor = "#2087ff";
                window.themeColors.bgLeds = "#222222";
                window.themeColors.whtie = "#ffffff";
                break;
            case "custom":
                document.querySelector('.customColors.hidden').style.display = 'block';
                
                primaryColor.value = window.themeColors.mainColor;
                bgColor.value = window.themeColors.bgLeds;
                whtie.value = window.themeColors.whtie;
                break;
            
        }

        setColors();
    });

    primaryColor.addEventListener('change', (event) => {
        window.themeColors.mainColor = event.target.value;
        setColors();
    });

    bgColor.addEventListener('change', (event) => {
        window.themeColors.bgLeds = event.target.value;
        setColors();
    });

    whtie.addEventListener('change', (event) => {
        window.themeColors.whtie = event.target.value;
        setColors();
    });

}

function list() {
    const listButton = document.getElementById("list");
    const list = document.querySelector(".list ul");
    const audio = document.querySelector('audio');
    const segmentDisplay = document.querySelector('segment-display');

    listButton.addEventListener("click", () => {
        window.scrollTo({
            top: window.scrollY == 0 ? 370 : 0,
            left: 0,
            behavior: 'smooth'
          })
    });

    const items = [
        'Billie Eilish - everything i wanted.mp3',
        'Billie Eilish - Ocean Eyes.mp3',
        'C. Tangana & Paloma Mami - No te debí besar.mp3',
        'tu-cancion.mp3'
    ];
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);

        li.addEventListener("click", (event) => {
            const nombreArchivo = event.target.textContent;
            audio.src = `./${nombreArchivo}`;
            segmentDisplay.setAttribute('text', nombreArchivo);
        });
    });

}

function speedControls() {

    const play = document.getElementById("play");
    const audio = document.querySelector('audio');
    const button = document.getElementById('next');
    let velocidadActual = 1.0;
    let tiempoUltimaAccion = 0;
    const incremento = 1.0;
    const velocidadMaxima = 5.0;
    const umbralTiempo = 250;
    let intervalo;

    function playButton() {
        audio.playbackRate = 1;

        if (audio.paused) {
            audio.play();
            document.getElementById("play").innerHTML = '&#xe802;';
        } else {
            audio.pause();
            document.getElementById("play").innerHTML = '&#xe801;';
        }
    }

    play.addEventListener("click", playButton);

    function actualizarVelocidad() {
        const ahora = Date.now();
        const tiempoDesdeUltimaAccion = ahora - tiempoUltimaAccion;

        velocidadActual = (tiempoDesdeUltimaAccion <= umbralTiempo) ? Math.min(velocidadActual + incremento, velocidadMaxima) : 2.0; // Reinicia a x2 en una nueva pulsación
        audio.playbackRate = velocidadActual;
        tiempoUltimaAccion = ahora;
    }

    function iniciarAceleracion() {

        console.log('audio.playbackRate', audio.playbackRate)
        console.log('tiempoUltimaAccion', tiempoUltimaAccion)

        actualizarVelocidad();
        audio.playbackRate = Math.min(audio.playbackRate + incremento, velocidadMaxima);
    }

    button.addEventListener('mousedown', () => {
        console.log('mousedown');
        iniciarAceleracion()
    });
    button.addEventListener('touchstart', () => {
        console.log('touchstart');
        iniciarAceleracion() 
    },{ passive: true });

    function detenerAceleracion() {
        clearInterval(intervalo);
        setTimeout(() => {
            if (Date.now() - tiempoUltimaAccion > umbralTiempo) {
                audio.playbackRate = 1.0; // Restablece la velocidad normal
                velocidadActual = 1.0;
            }
        }, umbralTiempo);
    }

    button.addEventListener('mouseup', () => {
        console.log('mouseup');
        detenerAceleracion()
    });
    button.addEventListener('mouseleave', () => {
        console.log('mouseleave');
        detenerAceleracion()
    });
    button.addEventListener('touchend', () => {
        console.log('touchend');
        detenerAceleracion()
    });
    button.addEventListener('touchcancel', () => {
        console.log('touchcancel');
        detenerAceleracion()
    });

    const buttonRetroceder = document.getElementById('prev');
    let velocidadRetroceso = -1.0;

    function actualizarRetroceso() {
        const ahora = Date.now();
        const tiempoDesdeUltimaAccion = ahora - tiempoUltimaAccion;

        velocidadRetroceso = (tiempoDesdeUltimaAccion <= umbralTiempo) ? Math.max(velocidadRetroceso - decremento, velocidadMaxima) : -2.0; // Reinicia a x2 en una nueva pulsación
        tiempoUltimaAccion = ahora;
    }

    function iniciarRetroceso() {
        actualizarRetroceso();
        intervalo = setInterval(() => {
            if (velocidadRetroceso > velocidadMaxima) {
                velocidadRetroceso = Math.max(velocidadRetroceso - decremento, velocidadMaxima);
            }
            audio.currentTime = Math.max(audio.currentTime + velocidadRetroceso, 0); // Retrocede en tiempo
        }, umbralTiempo);
    }

    buttonRetroceder.addEventListener('mousedown', () => { 
        iniciarRetroceso() 
    });
    buttonRetroceder.addEventListener('touchstart', () => { 
        iniciarRetroceso() 
    },{ passive: true });

    function detenerRetroceso() {
        clearInterval(intervalo);
        setTimeout(() => {
            if (Date.now() - tiempoUltimaAccion > umbralTiempo) {
                velocidadRetroceso = -1.0; // Restablece la velocidad normal de retroceso
            }
        }, umbralTiempo);
    }
    buttonRetroceder.addEventListener('mouseup', () => { 
        detenerRetroceso() 
    });
    buttonRetroceder.addEventListener('mouseleave', () => { 
        detenerRetroceso() 
    });
    buttonRetroceder.addEventListener('touchend', () => { 
        detenerRetroceso() 
    });
    buttonRetroceder.addEventListener('touchcancel', () => { 
        detenerRetroceso() 
    });


    progressCanvas.addEventListener("click", function(event) {
        const positionX = event.offsetX;
        const total = progressCanvas.clientWidth;
        const position = (positionX / total);

        console.log({
            duration: audio.duration,
            position 
        })

        if (audio.readyState >= 2) { // Si el audio está cargado
            audio.currentTime = 10;
        } else {
            audio.addEventListener("loadedmetadata", () => {
                audio.currentTime = audio.duration * position
            });
        }
    });
}
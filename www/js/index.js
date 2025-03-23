import "segment-display";
import "classic-equalizer";
import { SFTP } from './sftp.js';
import { FileList } from './fileList.js';
import { Settings } from './settings.js'
import { SpeedControls } from "./speedControls.js";

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

    equalizer.setAttribute('height', (screen.height*280)/480);
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

    if (window.SFTP.host) {
        document.getElementById('url').value = window.SFTP.host;
        document.getElementById('port').value = window.SFTP.port;
        document.getElementById('username').value = window.SFTP.username;
        document.getElementById('path').value = window.SFTP.path;
    }

    document.getElementById('sshConfig').addEventListener('click', () => {
        
        window.SFTP.setConfig(
            document.getElementById('url').value, 
            document.getElementById('port').value, 
            document.getElementById('username').value, 
            document.getElementById('password').value, 
            document.getElementById('path').value
        );
        
        setTimeout(() => {
            const segmentDisplay = document.querySelector('segment-display');

            const prevText = segmentDisplay.getAttribute('text');
            if (window.SFTP.status == 'Succes') {
                document.getElementById('settings').click();
                segmentDisplay.setAttribute('text', 'SSH SUCCES');
            } else {
                segmentDisplay.setAttribute('text', 'Conection ERROR');
            }
            setTimeout(() => {
                segmentDisplay.setAttribute('text', prevText);
            }, 3000);
        }, 800);
    });
}


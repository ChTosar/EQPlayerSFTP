export class FileList {

    static #instance;
    #listButton;
    #remoteList;
    #deviceList;
    #audio;
    #segmentDisplay;
    #items = [];
    #deviceItems = [];
    #lastCheck;
    defaultLocalPath;

    constructor() {
        if (FileList.#instance) {
            return FileList.#instance;
        }
        FileList.#instance = this;

        this.#listButton = document.getElementById("list");
        this.#remoteList = document.querySelector(".list ul.remoteList");
        this.#deviceList = document.querySelector(".list ul.deviceList");
        this.#audio = document.querySelector("audio");
        this.#segmentDisplay = document.querySelector("segment-display");
        this.defaultLocalPath = localStorage.getItem('defaultLocalPath') || cordova.file.externalRootDirectory + 'Music/';

        this.#setupEventListeners();
    }

    getNextSong() {
        const actual = this.#segmentDisplay.getAttribute('text'); 
        const index = this.#deviceItems.findIndex(device => device.name === actual);; 
        return this.#deviceItems[(index + 1) % this.#deviceItems.length];
    }

    getPrevtSong() {
        const actual = this.#segmentDisplay.getAttribute('text'); 
        const index = this.#deviceItems.findIndex(device => device.name === actual);; 
        return this.#deviceItems[(index - 1) % this.#deviceItems.length];
    }

    async playNextSong() {
        const file = this.getNextSong();
        const url = await this.#getURLfromFile(file.nativeURL);
        this.#attachToPlayer(url, file.name);
    }

    async playPrevSong() {
        const file = this.getNextSong();
        const url = await this.#getURLfromFile(file.nativeURL);
        this.#attachToPlayer(url, file.name);
    }

    async updateList() {
        const now = new Date().getTime();

        if (!this.#lastCheck || this.#lastCheck - now > 600000) {
            this.#items = await window.SFTP.listDirectory();
            this.#items = this.#items.filter(item => (item.isDir && !item.name.startsWith('.')) || item.name.endsWith(".mp3"));
            this.#lastCheck = now;
        }
    }

    async deviceList(folder) {
        folder = folder ? folder : '';
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(this.defaultLocalPath+folder, (fileSystem) => {        
                let reader = fileSystem.createReader();
                reader.readEntries((entries) => {
                    this.#deviceItems = entries.filter(item => (item.isDirectory && !item.name.startsWith('.')) || item.name.endsWith(".mp3"));
                    resolve(this.#deviceItems);
                  },
                  (err) => {
                    console.error(err);
                    reject(err);
                  }
                );
            
            }, (error) => {
                console.error("deviceList: ", error);
            });
        });
    }

    async #drawDeviceItems() {
        this.#deviceList.innerHTML = '';

        this.#deviceItems.forEach(item => {
            const li = document.createElement('li');

            li.file = {
                filepath: item.toURL(),
                name: item.name,
                isDirectory: item.isDirectory
            };

            if (item.isDirectory) {
                li.innerText = `/${item.name}`
            } else {
                const nameDivided = item.name.split('.');
                const extension = nameDivided.pop();
                li.innerHTML = `${nameDivided}<div class='badge'>${extension}<div>`;
            }

            this.#deviceList.appendChild(li);

            li.addEventListener("click", async (event) => {
                const fileName = event.target.file.name;

                if (event.target.file.isDirectory) {
                    await this.deviceList(fileName);
                    this.#drawDeviceItems();
                } else {
                    try {
                        await this.#attachToPlayer(event.target.file.filepath, fileName);
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        });
    }

    #getURLfromFile(filePath) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(filePath, (fileEntry) => {
                resolve(fileEntry.toURL());
                }, 
                (error) => {
                    reject(`Error al obtener el archivo: ${error.code}`);
                }
            );
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
                try {
                    const filePath = await this.#getURLfromFile(this.defaultLocalPath + event.target.file.name);
                    await this.#attachToPlayer(filePath, event.target.file.name);
                } catch (err) {
                    const newLocal = await window.SFTP.download(event.target.file.name);
                    await this.#attachToPlayer(newLocal, event.target.file.name);
                }
            });
        });
    }

    async listToggle(close) {

        const progressCanvas = document.getElementById("progressCanvas");

        close = close ? close : window.scrollY !== 0; 

        if (close) {
            this.#listButton.style.transform="";
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'});  
        } else {
            window.settings.settingToggle(true);
            this.#listButton.style.transform="rotate(180deg)";
            window.scrollTo({top: progressCanvas.offsetTop, left: 0, behavior: 'smooth'});
            await this.deviceList();
            this.#drawItems();
            this.#drawDeviceItems();
        }
    }

    async #setupEventListeners() {

        const remoteButton = document.querySelector(".remoteButton");
        const deviceButton = document.querySelector(".deviceButton");
        const remoteList = document.querySelector(".remoteList");
        const deviceList = document.querySelector(".deviceList");


        remoteButton.addEventListener("click", async () => {
            remoteButton.classList.add("selected");
            remoteList.classList.add("selected");

            deviceButton.classList.remove("selected");
            deviceList.classList.remove("selected");

            await this.updateList();
            this.#drawItems();
        });

        deviceButton.addEventListener("click", async () => {
            deviceButton.classList.add("selected");
            deviceList.classList.add("selected");

            remoteButton.classList.remove("selected");
            remoteList.classList.remove("selected");
            
            await this.deviceList();
            this.#drawDeviceItems();
        });

        this.#listButton.addEventListener("click", async () => {
            this.listToggle();
        });

        await this.deviceList();
    }

    #attachToPlayer(filePath, fileName) {

        return new Promise((resolve, reject) =>{

            this.#audio.onerror = (err) => {
                reject(err);
            };

            this.#audio.oncanplaythrough = () => {
                this.#segmentDisplay.setAttribute('text', fileName);
                window.speedControls.play(true);
                resolve(true);
            };

            this.#audio.src = filePath;
        });

    }
}
export class FileList {

    static #instance;
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

    getNextSong() {
        const actual = this.#audio.getAttribute('src'); 
        const index = this.#localItems.indexOf(actual); 
        return this.#localItems[(index + 1) % this.#localItems.length];
    }

    async updateList() {
        const now = new Date().getTime();

        if (!this.#lastCheck || this.#lastCheck - now > 600000) {
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

    async listToggle(close) {

        const progressCanvas = document.getElementById("progressCanvas");

        close = close ? close : window.scrollY !== 0; 

        console.log('listToggle close: ', {close, listButton: this.#listButton.style});

        if (close) {
            this.#listButton.style.transform="";
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'});  
        } else {
            window.settings.settingToggle(true);
            this.#listButton.style.transform="rotate(180deg)";
            window.scrollTo({top: progressCanvas.offsetTop, left: 0, behavior: 'smooth'});
            await this.localList();
            this.#drawLocalItems();
            this.#drawItems();
        }
    }

    async #setupEventListeners() {

        const localButton = document.querySelector(".localButton");
        const remoteButton = document.querySelector(".remoteButton");
        const localList = document.querySelector(".localList");
        const remoteList = document.querySelector(".remoteList");

        localButton.addEventListener("click", async () => {
            localButton.classList.add("selected");
            localList.classList.add("selected");

            remoteButton.classList.remove("selected");
            remoteList.classList.remove("selected");

            await this.localList();
            this.#drawItems();
        });

        remoteButton.addEventListener("click", async () => {
            remoteButton.classList.add("selected");
            remoteList.classList.add("selected");

            localButton.classList.remove("selected");
            localList.classList.remove("selected");
            
            await this.updateList();
            this.#drawItems();
        });

        this.#listButton.addEventListener("click", async () => {
            this.listToggle();
        });
    }

    #attachToplayer(fileName) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(`${cordova.file.dataDirectory}/${fileName}`, (fileEntry) => {
                this.#audio.src = fileEntry.toURL();
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
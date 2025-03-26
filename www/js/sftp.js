import CryptoJS from "crypto-js";
export class SFTP {

    host;
    username;
    path;
    port;
    #password;
    client;
    status = 'None';
    #localPath;

    constructor() {
        if (window.cordova) {
            this.#localPath = (localStorage.getItem('defaultLocalPath') || cordova.file.externalRootDirectory+'Music/').replace('file:///', '/');
            this.loadConfig();
        }
    }

    loadConfig() {

        var sshConfig = window.localStorage.getItem('sshConfig');

        if (sshConfig) {
            sshConfig = CryptoJS.AES.decrypt(sshConfig, device.uuid).toString(CryptoJS.enc.Utf8);
            sshConfig = JSON.parse(sshConfig);
            this.host = sshConfig.host;
            this.username = sshConfig.username;
            this.path = sshConfig.path;
            this.port = sshConfig.port;
            this.#password = sshConfig.password;

            this.connect();
        } else {
            console.log('Config not available');
        }
    }

    setConfig(host, port, username, password, path) {

        const sshConfig = CryptoJS.AES.encrypt(JSON.stringify({
            host, port, username, path, password
        }), device.uuid).toString();

        window.localStorage.setItem('sshConfig', sshConfig);

        this.loadConfig();
    }

    async connect() {
        try {
            this.client = await OurCodeWorldSFTP.createSFTPClient();
            
            this.client.setCredentials(this.host, this.username, this.#password, this.port);
            this.client.setPath(this.path);

            await this.listDirectory();
            this.status = 'Succes' 
            console.log("Conectado al servidor SFTP");
        } catch (error) {
            this.status = 'Error' 
            console.error("Error al conectar con SFTP:", error);
        }
    }

    listDirectory(directory) {

        directory = directory ?  directory : this.path;

        if (!this.client) {
            console.error("No hay conexión activa con SFTP");
            return;
        }

        this.client.setPath(directory);
        
        return new Promise((resolve, reject) => {
            this.client.list((data) => {
                console.log("Contenido del directorio:", data);
                resolve(data);
            }, (error) => {
                console.error("Error al listar el directorio:", error);
                reject(error);
            });
        });
    }

    async disconnect() {
        if (this.client) {
            await this.client.end();
            console.log("Desconectado del servidor SFTP");
        }
    }

    download(filename) {
        return new Promise((resolve, reject) => {
            const finalyLocal = `${this.#localPath}${filename}`.replace('/','file:///');

            this.client.downloadFile(`${this.path}/${filename}`, `${this.#localPath}${filename}`, {
                success:function(download){    
                    try {        
                        if(download.finished == true && download.success && download.success == true){                            
                            window.resolveLocalFileSystemURL(finalyLocal, (fileEntry) => {
                                    resolve(fileEntry.toURL());
                                }, 
                                (error) => {
                                    reject(`Error al obtener el archivo: ${error.code}`);
                                }
                            );
                        }
                    } catch(err) {
                        reject(err);
                    }
                },
                error:function(err){
                    reject(err);
                }
            });            
        });
    }
}
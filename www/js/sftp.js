export class SFTP {
    constructor() {
        this.host;
        this.username;
        this.path;
        this.port;
        this.password;
        this.client;

        this.loadConfig();
    }

    loadConfig() {

        let sshConfig = window.localStorage.getItem('sshConfig');

        if (sshConfig) {
            sshConfig = JSON.parse(sshConfig);
            this.host = sshConfig.host;
            this.username = sshConfig.username;
            this.path = sshConfig.path;
            this.port = sshConfig.port;
            this.password = sshConfig.password;

            this.connect();
        } else {
            console.log('Config not available');
        }
    }

    setConfig(host, port, username, password, path) {

        window.localStorage.setItem('sshConfig', JSON.stringify({
            host, port, username, path, password
        }));

        this.loadConfig();
    }

    async connect() {
        try {
            this.client = await OurCodeWorldSFTP.createSFTPClient();
            
            this.client.setCredentials(this.host, this.username, this.password, this.port);
            this.client.setPath(this.path);

            console.log("Conectado al servidor SFTP");
        } catch (error) {
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
            this.client.downloadFile(`${this.path}/${filename}`, `${cordova.file.dataDirectory.replace('file:///', '/')}${filename}`, {
                success:function(download){
                    console.log(download);
            
                    if(download.finished == true){
                        resolve(download);
                    }else{
                        console.log("Progress download : "+download.progress+"%. "+ download.bytesprogress +" bytes downloaded of " + download.filesizebytes + "total");
                    }
                },
                error:function(er){
                    console.log(er);
                    reject(er);
                }
            });            
        });
    }
}
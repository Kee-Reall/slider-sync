class Config {

    private backEndPort: number = 4000
    constructor(port?: unknown) {
        if(port) {
            this.backEndPort = +port || 4000 // by default 4000
        }
    }
    get mqttWsUri () {
        return 'ws://localhost:9001'
    }

    get socketUri() {
        return `http://192.168.100.28:${this.backEndPort}`
    }

    get mqttUri() {
        return 'mqtt://localhost:1883'
    }

    get port () {  // only on backend
        return this.backEndPort
    }


}


export const config = new Config(3000)
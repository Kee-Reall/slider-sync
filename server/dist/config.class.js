"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
class Config {
    constructor(port) {
        this.backEndPort = 4000;
        if (port) {
            this.backEndPort = +port || 4000; // by default 4000
        }
    }
    get mqttWsUri() {
        return 'ws://localhost:9001';
    }
    get socketUri() {
        return `http://192.168.100.28:${this.backEndPort}`;
    }
    get mqttUri() {
        return 'mqtt://localhost:1883';
    }
    get port() {
        return this.backEndPort;
    }
}
exports.config = new Config(3000);

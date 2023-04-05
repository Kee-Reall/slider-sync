"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mqtt_1 = __importDefault(require("mqtt"));
const app = (0, express_1.default)();
exports.server = http_1.default.createServer(app);
const io = new socket_io_1.Server(exports.server, { cors: {
        credentials: true
    } });
const mqClient = mqtt_1.default.connect('mqtt://localhost:1883');
mqClient.on('connect', function () {
    mqClient.subscribe('presence', function (err) {
        if (!err) {
            mqClient.publish('presence', 'Hello mqtt');
        }
    });
});
mqClient.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
    mqClient.end();
});
const rootHandler = (_, res) => res.status(201).json({ test: 'ok' });
const globalState = {
    value: 25,
    locker: null
};
let users = {};
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    socket.join('global');
    socket.on('registerSession', function (data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('inside registry');
            users[`${socket.id}`] = data;
            console.log(users);
            //@ts-ignore
            this.emit('getStateOnInitial', JSON.stringify(globalState));
        });
    });
    socket.on('stateChange', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const inp = JSON.parse(data);
        globalState.value = inp.value;
        globalState.locker = inp.locker;
        console.log(globalState);
        socket.to('global').emit('updateState', JSON.stringify(globalState));
    }));
    socket.on('unlock', () => __awaiter(void 0, void 0, void 0, function* () {
        globalState.locker = null;
        socket.to('global').emit('updateState', JSON.stringify(globalState));
    }));
    socket.on('disconnect', (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (globalState.locker === users[socket.id]) {
            globalState.locker = null;
            socket.to('global').emit('updateSate');
        }
        delete users[socket.id];
        console.log(users);
        console.log(globalState);
    }));
    socket.to(socket.id).emit('initial');
    socket.to('global').emit('updateState');
    console.log(users);
}));
app.get('/', rootHandler);

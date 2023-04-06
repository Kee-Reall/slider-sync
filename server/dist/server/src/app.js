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
//todo input validation
//todo fix codestyle
const app = (0, express_1.default)();
exports.server = http_1.default.createServer(app);
const io = new socket_io_1.Server(exports.server, { cors: {
        credentials: true
    } });
const mqClient = mqtt_1.default.connect('mqtt://localhost:1883');
const rootHandler = (_, res) => res.status(201).json({ test: 'ok' }); // only for test
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
            //@ts-ignore
            const that = this; // this in this context is specified socket witch emit event only on emmiter connection
            that.emit('getStateOnInitial', JSON.stringify(globalState));
        });
    });
    socket.on('stateChange', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const inp = JSON.parse(data);
        globalState.value = inp.value;
        globalState.locker = inp.locker;
        mqClient.publish('stateUpdate', JSON.stringify(globalState));
        console.log(globalState);
        socket.to('global').emit('updateState', JSON.stringify(globalState));
    }));
    socket.on('unlock', () => __awaiter(void 0, void 0, void 0, function* () {
        globalState.locker = null;
        mqClient.publish('stateUpdate', JSON.stringify(globalState));
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

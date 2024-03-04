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
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const rethinkdb_ts_1 = require("rethinkdb-ts");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
createConnection();
app.get('/api', (req, res) => {
    res.send('Hello World!');
});
io.on('connection', (socket) => {
    console.log('socket connected');
    setInterval(() => {
        socket.emit('interval', new Date());
    }, 1000);
});
httpServer.listen(3333, () => {
    console.log('server started');
});
function createConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield rethinkdb_ts_1.r.connect({
            host: 'localhost',
            port: 28015,
            authKey: '',
            db: 'rethinkdb_ex',
        });
    });
}

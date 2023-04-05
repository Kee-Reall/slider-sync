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
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
function bootstrap() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
        yield app_1.server.listen(port);
        console.log('Application has started on port: ' + port);
    });
}
bootstrap().catch((e) => console.error(e === null || e === void 0 ? void 0 : e.message));

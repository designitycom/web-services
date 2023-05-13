"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const debug_1 = __importDefault(require("debug"));
require('express-async-errors');
const debug = (0, debug_1.default)('app:main');
module.exports = function () {
    process.on('uncaughtException', (ex) => {
        debug(ex);
        winston_1.default.error(ex.message, ex);
        process.exit(1); //after this error should terminate program and reset with process manager
    });
    process.on('unhandledRejection', (ex) => {
        debug(ex);
        winston_1.default.error(ex.message, ex);
        process.exit(1); //after this error should terminate program and reset with process manager
    });
    winston_1.default.add(new winston_1.default.transports.File({ filename: 'logfile.log' })); //for save logs of routeControllers
};

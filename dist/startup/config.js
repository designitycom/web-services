"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
module.exports = function (app) {
    app.use(express_1.default.json()); //middleware for add body in req object
    app.use(express_1.default.urlencoded({ extended: true })); //middleware for read body of html forms from req ,extended for use array and object in value
    app.use(express_1.default.static('public'));
};

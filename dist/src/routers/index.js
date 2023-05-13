"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./user"));
const router = express_1.default.Router();
router.use('/user', user_1.default); //site.con/api/user
router.use('/x', user_1.default); //site.con/api/x
router.use('/y', user_1.default); //site.con/api/y
exports.default = router;

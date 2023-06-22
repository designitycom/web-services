import express from "express"
import MintController from "./controller";
import {mintParamValidator} from './../../middlewares/validator'
const mintRouter = express.Router();
import multer from 'multer';


mintRouter.post('/updateMint',  MintController.updateMint)
mintRouter.get('/startWorkerMint', MintController.startWorkerMint)


export default mintRouter;                   
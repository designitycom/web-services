import express from "express";
import SmartController from "./controller";
import { validateIdToken } from "./../../middlewares/validator";
const smartRouter = express.Router();

smartRouter.get("/callSmart", SmartController.callSmart);



export default smartRouter;

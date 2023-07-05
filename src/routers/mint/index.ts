import express from "express";
import MintController from "./controller";
import {validateIdToken } from "./../../middlewares/validator";
const mintRouter = express.Router();

mintRouter.post("/createMint", validateIdToken, MintController.createMint);
mintRouter.get("/getMintedTokenData/:workFlowId", MintController.getMintedTokenData);
mintRouter.post("/updateMint", validateIdToken, MintController.updateMint);
mintRouter.get("/getUpdatedMintTokenData/:workFlowId", MintController.getUpdatedMintTokenData);
mintRouter.get("/startWorkerMint", MintController.startWorkerMint);

export default mintRouter;

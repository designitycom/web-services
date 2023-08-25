import express from "express";
import MintController from "./controller";
import { validateIdToken } from "./../../middlewares/validator";
const mintRouter = express.Router();

mintRouter.post(
  "/checkUserThenCreateNft",
  validateIdToken,
  MintController.checkUserThenCreateNft
);
mintRouter.get(
  "/returnDataFromCheckUserThenCreateNft",
  validateIdToken,
  MintController.returnDataFromCheckUserThenCreateNft
);
mintRouter.post(
  "/getMagicLinkFromAirtable",
  validateIdToken,
  MintController.getMagicLinkFromAirtable
);
mintRouter.get(
  "/returnLogedinUserAiritableMagigLink",
  validateIdToken,
  MintController.returnLogedinUserAiritableMagigLink
);

export default mintRouter;

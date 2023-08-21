import express from "express";
import MintController from "./controller";
import { validateIdToken } from "./../../middlewares/validator";
const mintRouter = express.Router();

mintRouter.post(
  "/checkUserThenCreateNft",
  MintController.checkUserThenCreateNft
);
mintRouter.get(
  "/returnDataFromCheckUserThenCreateNft",
  MintController.returnDataFromCheckUserThenCreateNft
);
mintRouter.post(
  "/getMagicLinkFromAirtable",
  MintController.getMagicLinkFromAirtable
);
mintRouter.get(
  "/returnLogedinUserAiritableMagigLink",
  MintController.returnLogedinUserAiritableMagigLink
);

export default mintRouter;

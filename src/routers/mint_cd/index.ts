import express from "express";
import MintController from "./controller";
import { validateIdToken } from "./../../middlewares/validator";
const mintCdRouter = express.Router();

mintCdRouter.post(
  "/checkUserThenCreateNft",
  validateIdToken,
  MintController.checkUserThenCreateNft
);
mintCdRouter.get(
  "/returnDataFromCheckUserThenCreateNft",
  validateIdToken,
  MintController.returnDataFromCheckUserThenCreateNft
);
mintCdRouter.post(
  "/getMagicLinkFromAirtable",
  validateIdToken,
  MintController.getMagicLinkFromAirtable
);
mintCdRouter.get(
  "/returnLogedinUserAiritableMagigLink", //FIXME: refactor typo
  validateIdToken,
  MintController.returnLogedinUserAiritableMagigLink
);

export default mintCdRouter;

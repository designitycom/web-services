import express from "express"
import UserController from "./controller";
import { validateIdToken } from "../../middlewares/validator";
const userRouter = express.Router();



userRouter.post("/checkEmail", UserController.checkEmail)
userRouter.get("/getAllUserDTO/:workFlowId", UserController.getAllUserDTO)
userRouter.post("/getAllNFT",validateIdToken, UserController.getAllNFT)
userRouter.get("/checkGetAllNFTs/:workFlowId", UserController.checkGetAllNFTs)
userRouter.get("/startWorkerUser", UserController.startWorkerUser)


export default userRouter;
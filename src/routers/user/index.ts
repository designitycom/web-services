import express from "express"
import UserController from "./controller";
const userRouter = express.Router();



userRouter.post("/checkingEmail", UserController.checkEmail)
userRouter.get("/getAllUserDTO/:workFlowId", UserController.getAllUserDTO)
userRouter.post("/getAllNFT", UserController.getAllNFT)
userRouter.get("/getAllNFT/:workFlowId", UserController.getNFTDetails)
userRouter.get("/startWorkerUser", UserController.startWorkerUser)


export default userRouter;
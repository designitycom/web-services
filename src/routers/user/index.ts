import express from "express"
import UserController from "./controller";
const userRouter = express.Router();



userRouter.post("/checkEmail", UserController.checkEmail)
userRouter.get("/getAllUserDTO/:workFlowId", UserController.getAllUserDTO)
userRouter.post("/getAllNFT", UserController.getAllNFT)
userRouter.get("/checkGetAllNFTs/:workFlowId", UserController.checkGetAllNFTs)
userRouter.get("/startWorkerUser", UserController.startWorkerUser)


export default userRouter;
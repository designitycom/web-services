import express from "express"
import UserController from "./controller";
const userRouter = express.Router();



userRouter.post("/checkingEmail", UserController.checkEmail)
userRouter.post("/getAllNFT", UserController.getAllNFT)
userRouter.get("/startWorkerUser", UserController.startWorkerUser)


export default userRouter;
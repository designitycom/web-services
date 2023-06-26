import express from "express"
import UserController from "./controller";
const userRouter =express.Router();



userRouter.post("/checkingEmail",UserController.checkEmail )
userRouter.get("/startWorkerUser",UserController.startWorkerUser )
// userRouter.get("/getAllNFT",UserController.getAllNFT )


export default userRouter;
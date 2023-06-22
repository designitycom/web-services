import express from "express"
import userRouter from "./user"
import testRouter from "./test"
import mintRouter from "./mint";
const router =express.Router();



router.use('/user',userRouter);//site.con/api/user
router.use('/test',testRouter);//site.con/api/test
router.use('/mint',mintRouter);//site.con/api/mint
export default router; 
import express from "express"
import userRouter from "./user"
import testRouter from "./test"
const router =express.Router();



router.use('/user',userRouter);//site.con/api/user
router.use('/test',testRouter);//site.con/api/test
export default router; 
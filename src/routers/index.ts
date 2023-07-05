import express from "express"
import userRouter from "./user"
import testRouter from "./test"
import mintRouter from "./mint";
import airTableRouter from "./airtable";
const router =express.Router();



router.use('/user',userRouter);//site.con/api/user
router.use('/test',testRouter);//site.con/api/test
router.use('/mint',mintRouter);//site.con/api/mint
router.use('/airtable',airTableRouter);//site.con/api/airtable
export default router; 
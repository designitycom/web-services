import express from "express"
import UserController from "./controller";
const router =express.Router();


router.get('/',UserController.dashboard)//site.com/api/user


export default router;
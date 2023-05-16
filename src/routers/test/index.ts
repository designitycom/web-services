import express from "express"
import UserController from "./controller";
const router =express.Router();




router.post('/',UserController.check)//site.com/api/test


export default router;
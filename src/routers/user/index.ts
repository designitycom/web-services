import express from "express"
import UserController from "./controller";
const router =express.Router();




router.get('/',UserController.dashboard)//site.com/api/user

router.get('/login',UserController.login)//site.com/api/user/me
router.get('/jwk',UserController.jwk)
router.get('/jwks',UserController.jwks)


export default router;
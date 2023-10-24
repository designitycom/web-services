import express from "express"
import TestController from "./controller";
const router = express.Router();


router.post('/growth', TestController.growth)

export default router;                   
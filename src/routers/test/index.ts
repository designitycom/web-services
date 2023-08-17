import express from "express"
import TestController from "./controller";
import multer from 'multer';
import { body, header, query } from "express-validator";
import { mintParamValidator, ruleUser, validateIdToken,validate } from "../../middlewares/validator";
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage: storage })

router.post('/growth', TestController.growth)

export default router;                   
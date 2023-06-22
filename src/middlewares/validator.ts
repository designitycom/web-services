import { body } from "express-validator";
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})
const upload = multer({ storage: storage })
export const mintParamValidator=()=> [
    body('name').notEmpty(),
    body('description').notEmpty()
  ];
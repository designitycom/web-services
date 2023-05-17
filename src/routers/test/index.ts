import express from "express"
import UserController from "./controller";
import multer from 'multer';
const router =express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images/')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    },
  })
  
  const upload = multer({ storage: storage })




router.post('/',UserController.check)//site.com/api/test
router.post('/mint',upload.single('file'),UserController.mint)//site.com/api/test/mint


export default router;
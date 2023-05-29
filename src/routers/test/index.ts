import express from "express"
import TestController from "./controller";
import multer from 'multer';
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


router.post('/', TestController.check)//site.com/api/test
// router.post('/mint', upload.single('file'), TestController.mintWorkflow)//site.com/api/test/mint
router.post('/mint', upload.single('file'), TestController.mint)//site.com/api/test/mint
router.post('/mintCollection', upload.single('file'), TestController.mintCollection)//site.com/api/test/mint
router.post('/updateMint', upload.single('file'), TestController.updateMintWorkflow)//site.com/api/test/mint
router.get('/startWorkFlow', TestController.workflow)
router.get('/startWorker', TestController.mintWorker)
router.get('/getStatus/:workFlowId', TestController.getInfoWorkFlow)
router.post('/getAllNft',multer().none(), TestController.findAllMint)


router.get('/callSignalWorkFlow',TestController.callSignalWorkFlow)
router.get('/startWorkerSignal',TestController.startWorkerSignal)
router.get('/getStatusSignal',TestController.getStatusSignal)
router.get('/cancelSignal',TestController.cancelSignal)
router.get('/callSignal',TestController.callSignal)



router.get('/bigquery',TestController.bigQuery)

export default router;                   
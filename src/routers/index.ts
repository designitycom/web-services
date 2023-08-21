import express from "express";
import testRouter from "./test";
import mintRouter from "./mint";
import airTableRouter from "./airtable";
import handleError from "../middlewares/error";
const router = express.Router();

router.use("/health", (req, res) => {
  if (req.method === "GET") {
    res.send("connection is healthy ");
  }
});

router.use("/test", testRouter); //site.con/api/test
router.use("/mint", mintRouter); //site.con/api/mint
router.use("/airtable", airTableRouter); //site.con/api/airtable
router.use(handleError);
export default router;

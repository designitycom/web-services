import express from "express";
import testRouter from "./test";
import mintRouter from "./mint";
import mintCdRouter from "./mint_cd";
import airTableRouter from "./airtable";
import airTableCdRouter from "./airtable_cd";
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
router.use("/airtablecd", airTableCdRouter); //site.con/api/airtable
router.use("/mintcd", mintCdRouter); //site.con/api/airtable
router.use(handleError);
export default router;

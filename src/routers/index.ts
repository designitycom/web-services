import express from "express";
import userRouter from "./user";
import testRouter from "./test";
import mintRouter from "./mint";
import airTableRouter from "./airtable";
import smartRouter from "./smart";
const router = express.Router();

router.use("/health", (req, res) => {
  if (req.method === "GET") {
    res.send("connection is healthy ");
  }
});
router.use("/user", userRouter); //site.con/api/user
router.use("/test", testRouter); //site.con/api/test
router.use("/mint", mintRouter); //site.con/api/mint
router.use("/airtable", airTableRouter); //site.con/api/airtable
router.use("/smart", smartRouter); //site.con/api/smart
export default router;

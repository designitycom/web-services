import express from "express";
import AirTableCDController from "./controller";
const airTableCdRouter = express.Router();

airTableCdRouter.post(
  "/processPendingScores",
  AirTableCDController.processPendingScores
);

export default airTableCdRouter;

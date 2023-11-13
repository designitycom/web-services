import express from "express";
import AirTableController from "./controller";
const airTableRouter = express.Router();

airTableRouter.post(
  "/processPendingScores",
  AirTableController.processPendingScores
);

export default airTableRouter;

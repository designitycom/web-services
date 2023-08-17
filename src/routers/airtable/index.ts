import express from "express";
import AirTableController from "./controller";
const airTableRouter = express.Router();  

// airTableRouter.post("/getAllRecord", AirTableController.getAllRecord);
// airTableRouter.post("/getRecord", AirTableController.getRecord);
// airTableRouter.post("/createRecord", AirTableController.createRecord);
// airTableRouter.post("/updateRecord", AirTableController.updateRecord);
// airTableRouter.post("/deleteRecord", AirTableController.deleteRecord);
// airTableRouter.post("/findRecordWithEmail", AirTableController.findRecordWithEmail);
// airTableRouter.get("/startWorkerAirTable", AirTableController.startWorkerAirTable)

airTableRouter.post("processPendingScores", AirTableController.processPendingScores);

export default airTableRouter;

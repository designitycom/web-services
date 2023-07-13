import express from "express";
import AirTableController from "./controller";
const airTableRouter = express.Router();  

airTableRouter.post("/getAllRecord", AirTableController.getAllRecord);
airTableRouter.post("/getRecord", AirTableController.getRecord);
airTableRouter.post("/createRecord", AirTableController.createRecord);
airTableRouter.post("/updateRecord", AirTableController.updateRecord);
airTableRouter.post("/deleteRecord", AirTableController.deleteRecord);
// airTableRouter.get("/startWorkerAirTable", AirTableController.startWorkerAirTable)

export default airTableRouter;

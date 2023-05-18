import express from "express"
import router from "./routers"
import cors from "cors"
const app=express();
require('dotenv').config();

app.use(cors())
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));



app.use('/api',router);



const port=process.env.PORT||5000;



app.listen(port,()=>console.log('listening on port '+port))
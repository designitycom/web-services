import express from "express"
import router from "./src/routers"
const app=express();
require('dotenv').config();


app.use('/api',router);



const port=process.env.PORT||3000;



app.listen(port,()=>console.log('listening on port '+port))
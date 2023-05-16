
import winston from "winston"
import Debug from "debug";


require('express-async-errors');
const debug=Debug('app:main');


module.exports=function () {
    process.on('uncaughtException',(ex:Error)=>{//for save logs except routeControllers errors (sync functions)
        debug(ex);
        winston.error(ex.message,ex);
        process.exit(1);//after this error should terminate program and reset with process manager
    });

    process.on('unhandledRejection',(ex:Error)=>{//for save logs except routeControllers errors (async functions)
        debug(ex);
        winston.error(ex.message,ex)
        process.exit(1);//after this error should terminate program and reset with process manager
    });

    winston.add(new winston.transports.File({filename:'logfile.log'}));//for save logs of routeControllers
}
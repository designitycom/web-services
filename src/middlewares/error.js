import winston from "winston"

module.exports=(err,req,res,next)=>{ // error middleware
    winston.error(err.message,err)//for save error messages in log file
    res.status(500).json({message:'(server error) somthing failed'})
}
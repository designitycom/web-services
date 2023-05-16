import express from "express"

module.exports=function (app:any) {
    app.use(express.json());//middleware for add body in req object
    app.use(express.urlencoded({extended:true}));//middleware for read body of html forms from req ,extended for use array and object in value
    app.use(express.static('public'));
}
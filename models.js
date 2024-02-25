import Conn from "./dp_config.js"
import mongoose from "mongoose"

var userSchema = mongoose.Schema({
    roll : {type: "Number", required : true},
    name : {type : "String", required : true},
    dept : {type : "String", required : true},
    year : {type : "Number", required : true},
    password : {type : "String", required : true},
    coursesEnrolled : {type: "Array", default: []}
})

var courseScheme = mongoose.Schema({
    courseCode : String, 
    courseNo : Number,
    name : String,
    sem : Number,
    staff : String
})

var User = mongoose.model("users", userSchema)
var Course = mongoose.model("courses", courseScheme)

export { User, Course }
import Conn from "./dp_config.js"
import mongoose from "mongoose"

var userSchema = mongoose.Schema({
    roll : {type: "Number", required : true},
    name : {type : "String", required : true},
    dept : {type : "String", required : true},
    year : {type : "Number", required : true},
    password : {type : "String", required : true}
})

var User = mongoose.model("users", userSchema)

export { User }
import Conn from "./dp_config.js"
import mongoose, { mongo } from "mongoose"

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

var facultyScheme = mongoose.Schema({
    id: Number,
    name: String,
    password: String
})

var scheduleSchema = mongoose.Schema({
    courseNo : Number,
    hours : Object,
    location: String
})

var attendaceScheme = mongoose.Schema({
    date: String,
    hour : Number,
    staffName : String,
    courseNo: Number,
    rollNo : Number,
    isPresent: Boolean
})

var updatesScheme = mongoose.Schema({
    date: String,
    hour: Number,
    staffName : String,
    courseName : String,
    Location: String,
    type : String,
    courseNo: Number
})

var User = mongoose.model("users", userSchema)
var Course = mongoose.model("courses", courseScheme)
var Schedule = mongoose.model("schedules", scheduleSchema)
var Faculty = mongoose.model("faculties", facultyScheme)
var Attendance = mongoose.model("attendance", attendaceScheme)
var Update = mongoose.model("Updates", updatesScheme)

export { User, Course, Schedule, Faculty, Attendance, Update }
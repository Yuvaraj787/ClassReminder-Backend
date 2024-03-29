import { Router } from 'express';
import middleware from "./middleware.js"
import { User, Course, Schedule, Faculty } from "./models.js"
import axios from "axios"

const router = Router()


router.get("/getSchedule", async (req, res) => {
    console.log("received req")
    console.log(req.query.staffName)
    const staff = req.query.staffName
    const Courses = await Course.find({
        staff
    })
    const CourseNums = []
    //console.log(Courses)
    Courses.forEach(element => {
        CourseNums.push(element.courseNo)
    })

    console.log(CourseNums)

    var sch = await Schedule.find({
        courseNo: {
            $in: CourseNums
        }
    })
    console.log(sch)

    var schedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    }
    var courseNames = await Course.find({
        courseNo: {
            $in: CourseNums
        }
    })

    const courseNoToName = (courses, courseNo) => {
        console.log("Input got : ", courses, courseNo)
        var found = false;
        var obj;
        courses.every(course => {
            if (course.courseNo == courseNo) {
                console.log("Found")
                found = true
                obj = course
                return false;
            }
            return true;
        })
        if (found) {
            console.log("found")
            return obj
        }
        console.log("not found")
        return -1;
    }


    sch.forEach(sch => {
        var days = Object.keys(sch.hours)
        console.log(days)
        var courseDetail = courseNoToName(courseNames, sch.courseNo);
        days.forEach(day => {
            sch.hours[day].forEach(hour_no => {
                schedule[day].push({
                    hour: hour_no,
                    courseName: courseDetail.name,
                    courseCode: courseDetail.courseCode,
                    staff: courseDetail.staff,
                    course_No: sch.courseNo

                })
            })
        })
    })
    console.log(schedule)

    res.json(schedule)

})


router.get("/getStudentsList", async (req, res) => {
    console.log(req.query)

    var students = await User.find({
        coursesEnrolled: {
            $in: parseInt(req.query.courseNo)
        }
    })
    //console.log(students)
    var StudentsList = students.sort((a, b) => a.roll - b.roll)
    console.log(StudentsList)
    res.json(StudentsList)

})


router.post("/submitAtt", async (req, res) => {
    console.log(req.query)
})

export default router
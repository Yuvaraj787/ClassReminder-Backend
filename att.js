import { Router } from 'express';
import middleware from "./middleware.js"
import { User, Course, Schedule, Faculty, Attendance, Update } from "./models.js"
import axios from "axios"

const router = Router()
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs'

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
        var found = false;
        var obj;
        courses.every(course => {
            if (course.courseNo == courseNo) {
                found = true
                obj = course
                return false;
            }
            return true;
        })
        if (found) {
            return obj
        }
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
                    course_No: sch.courseNo,
                    location: sch.location

                })
            })
        })
    })

    console.log(schedule)

    const curDayNo = new Date().getDay()
    const startDay = curDayNo - 1;
    const sDay = new Date()
    const daysObj = {}
    const daysArray = []
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

    for (var i = 0; i < 7; i++) {
        daysObj[sDay.toLocaleDateString()] = days[(curDayNo + i) % 7]
        daysArray.push(sDay.toLocaleDateString())
        sDay.addDays(1)
    }

    console.log(daysObj)
    var updates = await Update.find({
        date: {
            $in: daysArray
        }
    }).exec()

    var removables = []
    var addables = []

    updates.forEach((up, ind) => {
        if (CourseNums.includes(up.courseNo)) {
            if (up.type == "minus") {
                removables.push({ day: daysObj[up.date], hour: up.hour })
            } else {
                addables.push({
                    day: daysObj[up.date],
                    classData: {
                        hour: up.hour,
                        courseName: up.courseName,
                        staff: up.staffName,
                        location: up.location,
                        courseCode: up.location
                    }
                })
            }
        }
    })

    removables.forEach(rmData => {
        console.log(rmData.day)
        schedule[rmData.day] = schedule[rmData.day].filter(obData => {
            return obData.hour != rmData.hour
        })
    })

    addables.forEach(addData => {
        schedule[addData.day].push(addData.classData)
    })
    console.log("get schedule success")
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
    var { Date, course_No, isPresentArray, Atthour, StaffName } = req.query
    console.log(req.query)
    var dataArr = [];

    Object.keys(isPresentArray).forEach(stud => {
        console.log(isPresentArray)
        dataArr.push({
            courseNo: course_No, date: Date, hour: Atthour, staffName: StaffName, rollNo: parseInt(stud), isPresent: isPresentArray[stud]
        })
    })

    await Attendance.insertMany(dataArr)
    console.log(dataArr)
    res.json({ success: true })
})


router.get("/getAtt", async (req, res) => {
    var { roll, courseNo } = req.query
    console.log(courseNo)
    courseNo = parseInt(courseNo)
    const arr = await Attendance.find({
        rollNo: roll,
        courseNo
    })
    console.log(arr)
    res.json(arr)
})

router.get("/getStudentAttendance", async (req, res) => {
    var { roll, courseNo } = req.query
    courseNo = parseInt(courseNo)
    const arr = await Attendance.find({
        rollNo: roll,
        courseNo
    })
    res.json(arr)
})

<<<<<<< HEAD
// router.get("/downloadAtt", async (req, res) => {
//     console.log("download requested")
//     try {

//     }
//     catch (err) {
//         console.log("Error : " + err.message)
//     }
// })


// router.get('/downloadAtt', async (req, res) => {
//     try {
//         // Fetch data from your database
//         const data = await fetchDataFromDatabase();
//         console.log("hi")
//         // Create a new Excel workbook
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Sheet 1');

//         // Populate data into the worksheet
//         data.forEach((row) => {
//             worksheet.addRow(row);
//         });
//         // console.log(data)
//         // Set response headers for Excel file
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
//         //console.log(res)
//         // Write the workbook to response
//         await workbook.xlsx.write(res);

//     } catch (error) {
//         console.error('Error generating Excel file:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// Function to fetch data from the database (replace with your actual database query)
async function fetchDataFromDatabase() {
    // Example data
    return [
        ['Name', 'Age'],
        ['John', 30],
        ['Alice', 25],
        ['Bob', 35]
    ];
}


=======
>>>>>>> 9c4eb3d9a01cbc5d34585b75f75f91e41ec847f5

export default router
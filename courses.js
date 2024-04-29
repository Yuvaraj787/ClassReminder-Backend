import { Router } from 'express';
import middleware from "./middleware.js"
import { User, Course, Schedule, Update, Info } from "./models.js"
import axios from "axios"

const router = Router()

const currentDate = new Date();
const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
const currentDay = currentDate.getDate();


router.get("/getAllCourses", async (req, res) => {
    try {
        var sem = 6 || req.query.sem
        var courses = await Course.aggregate(
            [
                {
                    $match: {
                        sem: 6
                    }
                },
                {
                    $group: {
                        _id: {
                            courseCode: "$courseCode",
                            name: "$name"
                        },
                        staffs: {
                            $push: "$staff"
                        }
                    }
                }
            ]
        );

        res.send(courses)
    } catch (err) {
        console.log("Error catched : " + err.message)
        res.json({ catchError: true })
    }
})



// INPUT NEEDED : SEM
// SAMPLE OUTPUT / RESPONSE (LIST OF ALL COURSES)
// [
//     {
//       "_id": "65d9ef5d98f6c2044485a9e4",
//       "sem": 6,
//       "courseNo": 2,
//       "name": "Data Science and Analytics Laboratory",
//       "staff": "Vidhya",
//       "courseCode": "IT5611",
//       "type": "Lab"
//     },
//     {
//       "_id": "65d9ef5d98f6c2044485a9e5",
//       "sem": 6,
//       "courseNo": 3,
//       "name": "Social Network Analysis",
//       "staff": "Mala",
//       "courseCode": "IT5020",
//       "type": "Theory"
//     },
//     {
//       "_id": "65d9ef5d98f6c2044485a9e6",
//       "sem": 6,
//       "courseNo": 4,
//       "name": "Distributed Systems and Cloud Computing",
//       "staff": "Swaminathan",
//       "courseCode": "IT5603",
//       "type": "Theory"
//     },
// ]

router.get("/getStaff", async (req, res) => {
    try {
        const courseCode = req.query.courseCode;

        const staffs = await Course.find({
            courseCode
        })

        var TargetStaffs = [];

        staffs.forEach(staff => {
            TargetStaffs.push(staff.staff)
        })
        res.json(TargetStaffs)
    } catch (err) {
        console.log("Error catched : " + err.message)
        res.json({ catchError: true })
    }
})


// INPUT NEEDED : COURSE_CODE
// SAMPLE OUTPUT / RESPONSE
// [
//     "Jasmine",
//     "Geetha"
// ]

router.post("/enrollCourse", middleware, async (req, res) => {
    try {

        const roll_no = req.roll;
        const courseCode = req.query.courseCode;
        const faculty = req.query.faculty;
        console.log(req.query)
        console.log("hi")
        const courseNo = await Course.findOne({
            courseCode, staff: faculty
        }).exec()

        const result = await User.updateOne({ roll: roll_no }, {
            $addToSet: {
                coursesEnrolled: courseNo.courseNo
            }
        })

        console.log(result);
        res.json({
            success: true
        })
    } catch (err) {
        console.log("Error in adding courses ", err.message);
        res.json({
            success: false,
        })
    }
})

// INPUT NEEDED : ROLL, COURSE-CODE, FACULTY-NAME (WHICH IS OBTAINED BY ABOVE ROUTE)
// SAMPLE OUTPUT / RESPONSE
// {
//     "success": true
//  }


router.get("/getMyCourses", async (req, res) => {
    try {
        console.log(req.query)
        const roll_no = req.query.roll;
        const courses = await User.findOne({
            roll: roll_no
        })
        console.log(courses)


        var userCourses = [];

        courses.coursesEnrolled.forEach(element => {
            userCourses.push(element[0])
        });

        var courseNames = await Course.find({
            courseNo: {
                $in: userCourses
            }
        })

        res.json(courseNames)
    } catch (Err) {
        console.log("Error in fetching user courses for choices ", Err.message)
        res.json({ catchError: true })
        res.json({ catchError: true })
    }
})

// INPUT NEEDED : ROLL
// SAMPLE OUTPUT / RESPONSE
// [
//     {
//       "_id": "65d9ef5d98f6c2044485a9e3",
//       "sem": 6,
//       "courseNo": 1,
//       "name": "Data Science and Analytics Laboratory",
//       "staff": "Bama",
//       "courseCode": "IT5611",
//       "type": "Lab"
//     },
//     {
//       "_id": "65d9ef5d98f6c2044485a9e9",
//       "sem": 6,
//       "courseNo": 7,
//       "name": "Data Science and Analytics Theory",
//       "staff": "Sendhil Kumar",
//       "courseCode": "IT5602",
//       "type": "Theory"
//     }
//   ]

const courseNoToName = (courses, courseNo) => {
    var found = true;
    var obj;
    courses.every(course => {
        if (course.courseNo == courseNo) {
            found = true
            obj = course
            return true;
        }
        return true;
    })
    if (found) {
        return obj
    }
    return -1;
}

const dayToNo = {
    "monday": 1,
    "tuesday": 2,
    "wednesday": 3,
    "thursday": 4,
    "friday": 5
};

Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};

Date.prototype.subDays = function (days) {
    this.setDate(this.getDate() - parseInt(days));
    return this;
};

router.get("/weeklySchedule", middleware, async (req, res) => {

    var schedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    }

    try {
        const roll_no = req.roll;
        const courses = await User.findOne({
            roll: roll_no
        })


        console.log("1 - ", courses)
        var userCourses = [];

        courses.coursesEnrolled.forEach(element => {
            userCourses.push(element[0])
        });

        console.log("2 - ", userCourses)

        var courseNames = await Course.find({
            courseNo: {
                $in: userCourses
            }
        })

        console.log("3 - ", courseNames)


        var schedules = await Schedule.find({
            courseNo: {
                $in: userCourses
            }
        })


        schedules.forEach(sch => {
            var days = Object.keys(sch.hours)
            console.log(days)
            var courseDetail = courseNoToName(courseNames, sch.courseNo);
            var courseDetail = courseNoToName(courseNames, sch.courseNo);
            days.forEach(day => {
                sch.hours[day].forEach(hour_no => {
                    schedule[day].push({
                        hour: hour_no,
                        courseName: courseDetail.name,
                        courseCode: courseDetail.courseCode,
                        staff: courseDetail.staff,
                        location: sch.location || "KP 406"
                    })
                })
            })
        })

        console.log("4 - ", schedule)

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
            if (userCourses.includes(up.courseNo)) {
                if (up.type == "minus") {
                    removables.push({ day: daysObj[up.date], hour: up.hour })
                } else {
                    addables.push({
                        day: daysObj[up.date],
                        classData: {
                            hour: up.hour,
                            courseName: up.courseName,
                            staff: up.staffName,
                            location: "Postponed",
                            courseCode: "Not given"
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

        console.log(updates)

        res.json(schedule)
    } catch (Err) {
        console.log("Error in fetching user courses of students ", Err.message)
        res.json({ catchError: true })
    }
})


router.get("/changeLocation", async (req, res) => {
    const courseNo = parseInt(req.query.courseNo);
    const newVenue = req.query.newLocation;
    const oldVenue = req.query.oldVenue;
    const staffName = req.query.staffName;
    const subject = req.query.subject;

    const rolls = []
    try {

        console.log(req.query)
        //console.log(courseNo + "," + location)
        //to update the location
        const res1 = await Schedule.updateOne({
            courseNo
        },
            {
                $set: {
                    location: newVenue
                }
            }
        )
        res.json({ success: true })
    } catch (err) {
        console.log("Error in updating location : " + err.message)
        res.json({ success: false })
    }


    try {
        const users = await User.aggregate([
            {
                $unwind: "$coursesEnrolled"
            },
            {
                $match: {
                    coursesEnrolled: courseNo
                }
            },
            {
                $group: {
                    _id: "$courseEnrolled",
                    students: {
                        $push: "$roll"
                    }
                }
            }
        ])
        console.log(users)
        const usersArr = users[0].students

        usersArr.forEach(roll => {
            rolls.push((roll + ""))
        })

        console.log(rolls)
    } catch (err) {
        console.log("Error in sending notification about venue Change : ", err.message);
    }
    try {
        const info = '📍 Venue Changed!'
        const detail = `${staffName} changed the venue of ${subject} from ${oldVenue} to ${newVenue}`

        await axios.post("https://app.nativenotify.com/api/indie/group/notification", {
            subIDs: rolls,
            appId: 19717,
            appToken: '6cGVSWyXY5RoTiF9pUgfiS',
            title: info,
            message: detail
        });

        var newInfo = new Info({
            staff: staffName,
            info: info,
            details: detail,
            date: currentDay.toString(),
            month: currentMonth
        })

        newInfo.save()

        res.send({
            success: true
        })
    } catch (err) {
        console.log("Error in sending notification about venue Change : ", err.message);
        res.send({
            notifyError: true
        })
    }


})


router.get("/cancelClass", async (req, res) => {
    try {
        const courseNo = parseInt(req.query.courseNo)
        const { hour, subject, staffName } = req.query

        const curDay = new Date()
        var minusDateString = curDay.toLocaleDateString()

        const minusUpdate = new Update({
            date: minusDateString,
            type: "minus",
            courseName: subject,
            staffName,
            hour,
            courseNo
        })

        await minusUpdate.save()

        const users = await User.aggregate([
            {
                $unwind: "$coursesEnrolled"
            },
            {
                $match: {
                    coursesEnrolled: courseNo
                }
            },
            {
                $group: {
                    _id: "$courseEnrolled",
                    students: {
                        $push: "$roll"
                    }
                }
            }
        ])
        console.log(users)
        const usersArr = users[0].students
        const rolls = []
        usersArr.forEach(roll => {
            rolls.push((roll + ""))
        })

        console.log(rolls)

        await axios.post(`https://app.nativenotify.com/api/indie/group/notification`, {
            subIDs: rolls,
            appId: 19717,
            appToken: '6cGVSWyXY5RoTiF9pUgfiS',
            title: 'Class  Cancelled',
            message: `Your ${subject} class in ${hour} hour is cancelled by Faculty ${staffName}`
        })

        res.send({
            success: true
        })

    } catch (err) {
        console.log("Error catched : " + err.message)
        res.json({ catchError: true })
    }

})


router.get("/postponeClass", async (req, res) => {
    try {
        const courseNo = parseInt(req.query.courseNo)
        console.log(courseNo)
        const staffName = req.query.staffName
        const { finalHour, finalDay, originalHour, subject, location } = req.query

        const finDay = new Date()
        var curDay = new Date()

        var dayNo = curDay.getDay()
        var finalDayNo = dayToNo[finalDay]
        var add = 0;
        var dayNo = curDay.getDay()
        var finalDayNo = dayToNo[finalDay]
        var add = 0;


        if (finalDayNo < dayNo) {
            add = (7 - dayNo) + finalDayNo
        } else {
            add = finalDayNo - dayNo
        }

        finDay.addDays(add)

        var minusDateString = curDay.toLocaleDateString()
        var plusDateString = finDay.toLocaleDateString()


        console.log("Source : ", minusDateString, "\n", "Destination : ", plusDateString)

            const minusUpdate = new Update({
                date: minusDateString,
                type: "minus",
                courseName: subject,
                staffName,
                hour: originalHour,
                courseNo
            })

        const plusUpdate = new Update({
            date: plusDateString,
            type: "plus",
            courseName: subject,
            staffName,
            hour: finalHour,
            location,
            courseNo
        })

        await Update.insertMany([minusUpdate, plusUpdate])

        console.log(req.query)

        const users = await User.aggregate([
            {
                $unwind: "$coursesEnrolled"
            },
            {
                $match: {
                    coursesEnrolled: courseNo
                }
            },
            {
                $group: {
                    _id: "$courseEnrolled",
                    students: {
                        $push: "$roll"
                    }
                }
            }
        ])
        console.log(users)
        const usersArr = users[0].students
        const rolls = []
        usersArr.forEach(roll => {
            rolls.push((roll + ""))
        })

        console.log(rolls)
        const info = '📌 Class postponed! 😃'
        const detail = `Your ${subject} class in ${originalHour} hour is postponed to ${finalDay} ${finalHour}th hour by ${staffName}`
        var newInfo = new Info({
            staff: staffName,
            info: info,
            details: detail,
            date: currentDay.toString(),
            month: currentMonth
        })
        await newInfo.save()

        await axios.post(`https://app.nativenotify.com/api/indie/group/notification`, {
            subIDs: rolls,
            appId: 19717,
            appToken: '6cGVSWyXY5RoTiF9pUgfiS',
            title: info,
            message: detail
        });
        res.send({
            success: true
        })
    } catch (err) {
        console.log("Error in sending notification about postponing of class : ", err.message);
        res.send({
            success: false
        })
    }

})


// INPUT NEEDED : ROLL
// SAMPLE RESPONSE
// {
//     "monday": [],
//     "tuesday": [
//       {
//         "hour": 1,
//         "courseName": "Data Science and Analytics Laboratory",
//         "courseCode": "IT5611"
//       },
//       {
//         "hour": 2,
//         "courseName": "Data Science and Analytics Laboratory",
//         "courseCode": "IT5611"
//       },
//       {
//         "hour": 3,
//         "courseName": "Data Science and Analytics Laboratory",
//         "courseCode": "IT5611"
//       },
//       {
//         "hour": 4,
//         "courseName": "Data Science and Analytics Laboratory",
//         "courseCode": "IT5611"
//       }
//     ],
//     "wednesday": [
//       {
//         "hour": 3,
//         "courseName": "Data Science and Analytics Theory",
//         "courseCode": "IT5602"
//       },
//       {
//         "hour": 4,
//         "courseName": "Data Science and Analytics Theory",
//         "courseCode": "IT5602"
//       }
//     ],
//     "thursday": [
//       {
//         "hour": 6,
//         "courseName": "Data Science and Analytics Theory",
//         "courseCode": "IT5602"
//       }
//     ],
//     "friday": []
//   }


const subjects = [
    [], [], [], [], [], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
]

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"]

router.get("/freehours", async (req, res) => {
    var schedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
    }


    var freehour = {
        monday: Array(8).fill(true),
        tuesday: Array(8).fill(true),
        wednesday: Array(8).fill(true),
        thursday: Array(8).fill(true),
        friday: Array(8).fill(true)
    }

    try {

        const userCourses = subjects[5]

        var schedules = await Schedule.find({
            courseNo: {
                $in: userCourses
            }
        })

        schedules.forEach(sch => {
            var days = Object.keys(sch.hours)
            console.log(days)
            days.forEach(day => {
                sch.hours[day].forEach(hour_no => {
                    schedule[day].push({
                        hour: hour_no
                    })
                })
            })
        })

        console.log(schedule)

        weekdays.forEach(day => {
            schedule[day].forEach(hour => {
                freehour[day][hour.hour - 1] = false
            })
        })

        schedule = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: []
        }

        weekdays.forEach(day => {
            freehour[day].forEach((hour, ind) => {
                if (hour) {
                    schedule[day].push(ind + 1);
                }
            })
        })

        const curDayNo = new Date().getDay()
        const startDay = curDayNo - 1;
        const sDay = new Date()
        const daysObj = {}
        const daysArray = []
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

        for (var i = 0; i < 7; i++) {
            if (sDay.getDay() == 0 || sDay.getDay() == 6) {
                sDay.addDays(1);
                continue;
            }
            daysObj[sDay.toLocaleDateString()] = days[(curDayNo + i) % 7]
            daysArray.push(sDay.toLocaleDateString())
            sDay.addDays(1)
        }

        var updates = await Update.find({
            date: {
                $in: daysArray
            }
        }).exec()

        var removables = []
        var addables = []

        updates.forEach((up, ind) => {
            if (up.type == "plus") {
                removables.push({ day: daysObj[up.date], hour: up.hour })
            } else {
                addables.push({ day: daysObj[up.date], hour: up.hour })
            }
        })
        removables.forEach(rmData => {
            schedule[rmData.day] = schedule[rmData.day].filter(hour => hour != rmData.hour)
        })

        addables.forEach(addData => {
            schedule[addData.day].push(addData.hour)
        })

        res.json(schedule)

    } catch (Err) {
        console.log("Error in fetching user courses to fetch free hours", Err.message)
    }
})

export default router;
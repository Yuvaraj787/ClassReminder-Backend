import { Router } from 'express';
import middleware from "./middleware.js"
import { User, Course, Schedule } from "./models.js"
import axios from "axios"

const router = Router()

router.get("/getAllCourses", async (req, res) => {
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
    const courseCode = req.query.courseCode;

    const staffs = await Course.find({
        courseCode
    })

    var TargetStaffs = [];

    staffs.forEach(staff => {
        TargetStaffs.push(staff.staff)
    })
    res.json(TargetStaffs)
})


// INPUT NEEDED : COURSE_CODE
// SAMPLE OUTPUT / RESPONSE
// [
//     "Jasmine",
//     "Geetha"
// ]

router.post("/enrollCourse", middleware, async (req, res) => {
    const roll_no = req.roll;
    const courseCode = req.query.courseCode;
    const faculty = req.query.faculty;
    console.log(req.query)
    console.log("hi")
    try {
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
            success: true,
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
        //console.log(courses)
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
        console.log("Error in fetching user courses ", Err.message)
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
    console.log("Input got : ", courses, courseNo)
    var found = true;
    var obj;
    courses.every(course => {
        if (course.courseNo == courseNo) {
            console.log("Found")
            found = true
            obj = course
            return true;
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
        const roll_no =  req.roll;
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

        console.log("4 - ", schedules)

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

        res.json(schedule)
    } catch (Err) {
        console.log("Error in fetching user courses ", Err.message)
    }
})


router.get("/changeLocation", async (req, res) => {
    const courseNo = req.query.courseNo;
    const location = req.query.location;
    try {
        await Schedule.updateOne({
            courseNo
        },
        {
            $set: {
                location: location
            }
        }
        )
        res.json({success: true})
    } catch (err) {
        console.log("Error in updating location : " + err.message)
        res.json({success: false})
    }
})

router.get("/notifyEnrolledStudents", async (req, res) => {
    const courseNo = parseInt(req.query.courseNo)
    console.log(courseNo)
    const staffName = req.query.staffName
    const { finalHour, finalDay, originalHour, subject } = req.query
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
    try {
        await axios.post(`https://app.nativenotify.com/api/indie/group/notification`, {
            subIDs: rolls,
            appId: 19717,
            appToken: '6cGVSWyXY5RoTiF9pUgfiS',
            title: 'Class postponed! 😃',
            message: `Your ${subject} class in ${originalHour} hour is postponed to ${finalDay} ${finalHour}th hour by ${staffName}`
        });
        res.send({
            success: true
        })
    } catch (err) {
        console.log("Error in sending notification about postponing of class : ", err.message);
        res.send({
            success: true
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
const days = ["monday", "tuesday", "wednesday", "thursday", "friday"]

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

        days.forEach(day => {
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

        days.forEach(day => {
            freehour[day].forEach((hour, ind) => {
                if (hour) {
                    schedule[day].push(ind + 1);
                }
            })
        })

        res.json(schedule)

    } catch (Err) {
        console.log("Error in fetching user courses ", Err.message)
    }
})

export default router;
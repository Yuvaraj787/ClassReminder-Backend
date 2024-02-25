import { Router } from 'express';
import middleware from "./middleware.js"
import { User, Course } from "./models.js"

const router = Router()

router.post("/getStaff", async (req, res) => {
    const courseCode = "IT5613" || req.query.courseCode;

    const staffs = await Course.find({
        courseCode  
    })

    var TargetStaffs = [];

    staffs.forEach(staff => {
        TargetStaffs.push(staff.staff)
    })

    res.json(TargetStaffs)

})

router.post("/enrollCourse", async (req, res) => {
    const roll_no = 2021115125 || req.roll;
    const courseCode = "IT5611" || req.query.courseCode;
    const faculty = "Bama" || req.query.faculty;
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
            success: false,
        })
    }
})


router.get("/getMyCourses", async (req, res) => {
    try {
        const roll_no = 2021115125 || req.roll;
        const courses = await User.findOne({
            roll: roll_no
        })
        console.log(courses)
        var userCourses = [];

        courses.coursesEnrolled.forEach(element => {
            userCourses.push(element[0])
        });

        var courseNames = await Course.find({
            courseNo : {
                $in : userCourses
            }
        })

        res.json(courseNames) 
    } catch (Err) {
        console.log("Error in fetching user courses ", Err.message)
    }
})


export default router;
import { Router } from "express";
const router = Router()
import Conn from "./dp_config.js";
import Jwt from "jsonwebtoken"
import { User, Faculty } from "./models.js"
import middleware from "./middleware.js"

router.post("/register", async (req, res) => {
    try {
        console.log("got it")
        const userDetails = req.query
        console.log(req.query);
        const existingUser = await User.findOne({
            roll: userDetails.roll
        }).exec()
        console.log(existingUser);
        if (existingUser) {
            console.log("INFO: User already exit")
            res.json({
                success: false,
                newUser: true,
                error: false
            })
            return;
        }
        const newUser = new User(userDetails)
        await newUser.save()

        console.log("SUCCCESS: User Registered")
        res.json({
            success: true,
            newUser: false,
            error: false
        })

    } catch (err) {
        console.log("ERROR! Error in uploading userdata", err.message)

        res.json({
            success: false,
            newUser: false,
            error: true
        })
    }
})

router.post("/verify", middleware, (req, res) => {
    try {
        console.log("Sent success", req.roll);
        res.json({
            success: true,
            roll: req.roll,
            isFaculty: req.isFaculty
        })
    } catch (err) {
        console.log("Error catched : " + err.message)
        res.json({ catchError: true })
    }
})

router.post("/login", async (req, res) => {
    try {
        const rollno = req.query.roll;
        const password = req.query.password;
        console.log("Received");
        console.log(rollno, password);
        var response = { // RESPONSE FORMAT
            wrongPassword: false,
            newUser: false,
            error: false,
            token: "",
            userData: {}
        }

        const target_user = await User.findOne({
            roll: rollno,
        }).exec()

        console.log(target_user);

        if (target_user) {
            if (target_user.password == password) {
                response.newUser = false;
                response.wrongPassword = false;
                response.token = Jwt.sign({
                    roll: rollno,
                    isFaculty: false
                }, "test123", { expiresIn: (60 * 60) * 60 })
                response.userData = target_user
            } else {
                response.newUser = false;
                response.wrongPassword = true;
            }
        } else {
            response.newUser = true;
            response.wrongPassword = true;
        }
        res.json(response)
    } catch (err) {
        console.log("Error catched : " + err.message)
        res.json({ catchError: true })
    }
})

router.post("/staff/login", async (req, res) => {
    try {
        const name = req.query.name
        const password = req.query.password

        console.log("staff login triggered")
        console.log(name, password)
        var response = { // RESPONSE FORMAT
            invalid: true,
            name: name,
            token: "",
            userData: {}
        }

        const target_staff = await Faculty.findOne({
            name, password
        }).exec()

        console.log(target_staff)

        if (target_staff) {
            console.log("valid")
            response.token = Jwt.sign({
                roll: name,
                isFaculty: true
            }, "test123", { expiresIn: (60 * 60) * 60 })
            response.invalid = false
            response.id = target_staff.staff_id
        }
        console.log(response)
        res.json(response)
    } catch (err) {
        console.log("Error catched : " + err.message)
        res.json({ catchError: true })
    }
})

router.post("/changePw", async (req, res) => {
    const rollNum = req.query.roll
    const pw = req.query.passWord
    const staff = req.query.staff
    const name = req.query.name
    console.log(rollNum + " " + pw + " " + name)
    if (!rollNum) {

        try {
            const user = await Faculty.findOneAndUpdate(
                { name: name },
                { $set: { password: pw } },
                { new: true }
            );
            console.log(user);
            if (user) {
                console.log("Updated successfully");
                res.send({ sucess: true })
            } else {
                console.log("Failed to update");
                res.send({ sucess: false })
            }
        } catch (err) {
            console.error("Error:", err);
        }

    }
    else {
        try {
            const user = await User.findOneAndUpdate(
                { roll: rollNum },
                { $set: { password: pw } },
                { new: true }
            );
            console.log(user);
            if (user) {
                console.log("Updated successfully");
                res.send({ sucess: true })
            } else {
                console.log("Failed to update");
                res.send({ sucess: false })
            }
        } catch (err) {
            console.error("Error:", err);
        }

    }


})
export default router;

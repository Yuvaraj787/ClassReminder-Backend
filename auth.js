import { Router } from "express";
const router = Router()
import Conn from "./dp_config.js";
import Jwt from "jsonwebtoken"
import { User } from "./models.js"; 
import middleware from "./middleware.js"

router.post("/register", async (req,res) => {
   
    const userDetails = req.query
    console.log("received")
    console.log(req.query);
    const existingUser = await User.findOne({
        roll: userDetails.roll
    }).exec()
    console.log(existingUser);
    if (existingUser) {
        console.log("INFO: User already exit")
        res.json({
            success : false,
            newUser : true,
            error : false
        })
        return;
    }
    const newUser = new User(userDetails)
    try {
        await newUser.save()
        console.log("SUCCCESS: User Registered")
        res.json({
            success: true,
            newUser: false,
            error: false
        })
        
    } catch(err) {
        console.log("ERROR! Error in uploading userdata", err.message)

        res.json({
            success: false,
            newUser: false,
            error: true
        })
    }
})

router.post("/verify", middleware, (req, res) => {
    console.log("Sent success", req.roll);
    res.json({
        success : true,
        roll: req.roll
    })
})

router.post("/login", async (req,res) => {
    const rollno = req.query.roll;
    const password = req.query.password;
    console.log("Received");
    console.log(rollno, password);
    var response = { // RESPONSE FORMAT
        wrongPassword : false,
        newUser : false,
        error : false,
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
                roll: rollno
            },"test123",{   expiresIn : (60 * 60) * 60    })
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
})

export default router;

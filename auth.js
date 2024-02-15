import { Router } from "express";
const router = Router()
import Conn from "./dp_config.js";
import { User } from "./models.js"; 


router.get("/register", async (req,res) => {

    const userDetails = {
        name: "Dhanush", dept:"IT", roll:2021115026, password: "abcdefgh", year: 3
    }
    // var response = {  RESPONSE FORMAR
    //     success: false,
    //     newUser : false,
    //     error : false
    // }
    const existingUser = User.findOne({
        roll: userDetails.roll
    })
    if (existingUser) {
        res.send({
            success : false,
            newUser : true,
            error : false
        })
    }
    const newUser = new User(userDetails)
    try {
        await newUser.save()
        res.send({
            success: true,
            newUser: false,
            error: false
        })
        
    } catch(err) {
        res.send({
            success: false,
            newUser: false,
            error: true
        })
        console.log("ERROR! Error in uploading userdata", err.message)
    }
})

router.get("/login", async (req,res) => {
    const rollno = 2021115025;
    const password = "abcdefgh";
    var response = { // RESPONSE FORMAT
        wrongPassword : false,
        newUser : false,
        error : false
    }
    const target_user = await User.findOne({
        roll: rollno,
    }).exec()
    console.log(target_user);
    if (target_user) {
        if (target_user.password === password) {
            response.newUser = false;
            response.wrongPassword = false;
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

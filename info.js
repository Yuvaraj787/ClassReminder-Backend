import { Router } from 'express';
import middleware from "./middleware.js"
import { User, Course, Schedule, Update } from "./models.js"
import axios from "axios"

const router = Router()
router.get("/getAllInfos", async (req, res) => {
    console.log("hi")
    var result = []
    //staff name,info,detail,date,month
    ///{"staff":"Swaminathan","info":"Class Cancelled","detail":"Tuesday 7nd hour class cancelled","date":"16","month":"Feb"},



    res.send(result)
})

export default router;
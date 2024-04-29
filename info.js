import { Router } from 'express';
import middleware from "./middleware.js"
import { User, Course, Schedule, Update, Info } from "./models.js"
import axios from "axios"

const router = Router()
router.get("/getAllInfos", async (req, res) => {
    console.log("hi")
    var result = []
    //staff name,info,detail,date,month
    ///{"staff":"Swaminathan","info":"Class Cancelled","detail":"Tuesday 7nd hour class cancelled","date":"16","month":"Feb"},
    const info = await Info.find({}).sort({ _id: -1 }).limit(15);
    info.forEach(inf => {
        result.push(inf)
    });

    console.log(result)
    res.send(result)
})

export default router;
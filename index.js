import Express from "express"
import bodyParser from "body-parser"
import AuthRoutes from "./auth.js"
import CourseRoutes from "./courses.js"
import Attendance from "./att.js"
import Info from "./info.js"

import Conn from "./dp_config.js";
import cors from "cors"
const app = Express()
const port = process.env.PORT || 3000;
import axios from "axios";

app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())

app.use("/auth", AuthRoutes)
app.use("/user", CourseRoutes)
app.use("/att", Attendance)
app.use("/info", Info)

// app.get("/login", (req,res) => {
//     res.send("<h1>Yeah It's Working</h1>");
// })

// router.get("/signup", (req,res) => {
//     res.
// })

const sendNotification = async () => {
    const now = new Date();
    console.log(now.getHours(), now.getMinutes());
    if (now.getHours() == 14 && now.getMinutes() == 52) {
        console.log("it is time")
        var data = await axios.post(`https://app.nativenotify.com/api/indie/notification`, {
            subID: '2021115125',
            appId: 19717,
            appToken: '6cGVSWyXY5RoTiF9pUgfiS',
            title: 'TImer is now 2.50pm',
            message: 'put your push notification message here as a string'
        })
    }
}



app.get("/check", async (req, res) => {
    try {
        console.log("ok");

        console.log("notify status : ", req.query)
        res.send({ ok: true });
    } catch (err) {
        console.log("Error catched : " + err.message)
    }
})


const server = app.listen(port, () => {
    const { address, port } = server.address();
    console.log(`Hey, Server is listening on ${address}:${port}`)
})
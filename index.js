import Express from "express"
import bodyParser from "body-parser"
import AuthRoutes from "./auth.js"
import CourseRoutes from "./courses.js"
import Attendance from "./att.js"
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


// setInterval(() => {
//     sendNotification();
//     console.log("checking")
// }, 60 * 500)

app.get("/shi", async (req, res) => {
    console.log("ok");

    console.log("notify status : ", data.data)
    res.send({ ok: true });
})


app.listen(port, () => {
    console.log("Hey, Server is listening on port : " + port)
})
import Express from "express"
import bodyParser from "body-parser"
import AuthRoutes from "./auth.js"
import Conn from "./dp_config.js";
const app = Express()
const port = 3000
app.use(bodyParser.urlencoded({extended: true}))

app.use("/auth", AuthRoutes)
// app.get("/login", (req,res) => {
//     res.send("<h1>Yeah It's Working</h1>");
// })

// router.get("/signup", (req,res) => {
//     res.
// })

app.get("/shi", (req,res) => {
    console.log("ok");
    res.send({ok : true});
})

app.listen(port, () => {
    console.log("Server is listening on port : " + port)
})
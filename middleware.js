import Jwt from "jsonwebtoken"


const verifyToken = (req, res, next) => {
    console.log("token verification going on")
    const token = req.query.token;
    try {
        const roll_no = Jwt.verify(token, "test123").roll;
        req.roll = roll_no
        if (roll_no) {
            console.log("SUCCESS: Token Verication")
            next();
        } else {
            console.log("FAILURE: Token Verication")
        res.json({success : false})
        }
    } catch (err) {
        res.json({success: false})
    }
}

export default verifyToken;
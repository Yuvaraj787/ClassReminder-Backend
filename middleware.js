import Jwt from "jsonwebtoken"


const verifyToken = (req, res, next) => {
    console.log("token verification going on")
    const token = req.query.token;
    try {
        const decoded = Jwt.verify(token, "test123");
        req.roll = decoded.roll
        req.isFaculty = decoded.isFaculty
        console.log(decoded)
        if (req.roll) {
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
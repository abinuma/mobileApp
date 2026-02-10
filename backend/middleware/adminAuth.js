import jwt from "jsonwebtoken";

const adminAuth = async (req,res,next) => {
    try {
        const token = req.headers.authorization
        if (!token) {
            return res.json({ success: false, message: "not Authorized login again" });
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "not Authorized login again" });
        }
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message});
    }
}

export default adminAuth;

/*
after we successfully verify the token we call next(). next() means: “I’m done here — pass control to the next middleware or route handler.”

*/
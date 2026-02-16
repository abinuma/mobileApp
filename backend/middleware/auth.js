import jwt from 'jsonwebtoken';

const authUser = async (req,res,next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.json({success: false, message: 'Not  Authorized Login Again'})
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        // req.body.userId = token_decode.id;
        req.userId = token_decode.id;
        next();
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export default authUser;

/*
This middleware checks for a JWT token in the request headers, verifies it, and if valid, attaches the user ID to the request body for use in subsequent controllers. If the token is missing or invalid, it responds with an error message. This ensures that only authenticated users can access certain routes.

jwt.verify() 👉 returns the decoded payload that was originally signed inside the token.

*/
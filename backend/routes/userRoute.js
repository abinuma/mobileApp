import express from "express"
import { loginUser,registerUser,adminLogin } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)//where is the admin login route called in the frontend?

export default userRouter;

// Each route is associated with a specific controller function that handles the request logic.
import express from "express";
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";

//App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//Middlewares
app.use(express.json());
app.use(cors())

//api Endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)

app.get('/', (req,res)=> {
    res.send('API Working')
})

app.listen(port,()=> console.log('Server started on port : ' + port))


/* the main purpose of this file is to set up and start an Express server that connects to a MongoDB database and configures Cloudinary for media management.configure here means .why do we configure cloudinary

this line:
app.use('/api/user', userRouter);
Means:“For any request that starts with /api/user,
hand it over to userRouter.”. Why do we do it this way?
✅ Clean structure
✅ Easier to scale
✅ Separate concerns
app.use() allows the backend to read json from requests, modularize routes, making the codebase cleaner and more maintainable.
*/
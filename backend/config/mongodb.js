import mongoose from 'mongoose';

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log('DB Connected')
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/ecommerce` )
}

export default connectDB;


//here MONGODB_URI is used to securely store the connection string for the MongoDB database in environment variables. and  /ecommerce is the name of the specific database within the MongoDB server that the application will connect to.this code will be used for storing the user in mongodb atlas cloud database.
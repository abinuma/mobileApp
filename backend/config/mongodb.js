import mongoose from 'mongoose';

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log(`DB Connected! Database: ${mongoose.connection.name} Host: ${mongoose.connection.host}`);
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/ecommerce` )
}

export default connectDB;


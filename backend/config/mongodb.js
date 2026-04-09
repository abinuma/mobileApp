import mongoose from 'mongoose';

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log('------------------------------------------');
        console.log('✅ DATABASE CONNECTED');
        console.log(`[DEBUG] DB Name: ${mongoose.connection.name}`);
        console.log(`[DEBUG] DB Host: ${mongoose.connection.host}`);
        console.log('------------------------------------------');
    })
    
    // Explicitly logging the URI (redacted) to ensure it's what we expect
    const redactedUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ":****@") : "MISSING";
    console.log(`[DEBUG] Attempting connection to: ${redactedUri}/mobileAppEcommerce`);
    
    await mongoose.connect(`${process.env.MONGODB_URI}/mobileAppEcommerce` )
}

export default connectDB;


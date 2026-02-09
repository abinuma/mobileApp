import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    cartData: {type: Object, default: {}}
}, {minimize: false});

const userModel = mongoose.models.user || mongoose.model("user" , userSchema)

export default userModel



/*Mongoose sits between: JavaScript code ↔ MongoDB. Mongoose removes empty objects when saving With: minimize: false Empty objects are kept 
schema in mongo db is the same as 

| Relational DB (SQL) | MongoDB (NoSQL)              |
| ------------------- | ---------------------------- |
| Database            | Database                     |
|   Table             | Collection                   |
| Row                 |     Document                 |
| Column              | Field                        |
| Schema              | Schema (optional / flexible) |

When we create a user model, Mongoose maps it to the users collection in MongoDB.
When we query, Mongoose fetches documents from users and converts each document into a user object in JavaScript.
That’s why we use user._id, not users._id.


this line says:
mongoose.models.user || mongoose.model("user", userSchema)
If a user model already exists, reuse it.Otherwise, create it.Mongoose caches models globally

Reloading code can try to recreate the same model.This line prevents crashes:
mongoose.models.user || mongoose.model("user", userSchema)

*/
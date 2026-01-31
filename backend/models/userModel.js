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

*/
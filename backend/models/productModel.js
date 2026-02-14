import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {type: String,required: true},
    description: {type: String,required: true},
    price: {type: Number, required: true},
    image: {type: Array, required: true},
    category: {type: String, required: true},
    subCategory: {type: String, required: true},
    sizes: {type: Array, required: true},
    bestseller : {type: Boolean},
    date: {type: Number, required :true}


})

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;

/*
in mongoose.model("product", productSchema);
The first argument "product" is the model name.What Mongoose does internally:Takes "product",Converts it to lowercase,Pluralizes it
*/
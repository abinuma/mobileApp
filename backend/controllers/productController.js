import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
// function for add product

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    const sizeOrder = [ "S", "M", "L", "XL", "XXL"];

// parse sizes
let parsedSizes = JSON.parse(sizes);

// sort according to predefined order
parsedSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: parsedSizes, // ✅ sorted sizes
 //used to convert stringified array back to actual array(because Data coming from req.body is ALWAYS a string)
      image: imagesUrl,
      date: Date.now(),
    };
    console.log(productData);

    const product = new productModel(productData);
    await product.save();
    res.json({ success: true, message: "Product added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for list products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {
    const {productId} = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };

/*
API as a waiter analogy (classic but accurate)
You = Customer (Frontend)
Kitchen = Backend logic + DB
Waiter = API

You never go into the kitchen.You talk only to the waiter.

API:
Takes your order
Talks to kitchen
Returns food (response)

Frontend (React) = Customer
API (Express routes) = Menu/Waiter
Backend (Node.js + MongoDB) = Kitchen
Data (JSON) = Food delivered

An API is an agreed-upon interface that defines how external programs can interact with a system without knowing its internal implementation.
API = Application Programming Interface.
is  SET OF RULES for different software to talk to each other

With upload.fields(), every field is an array, even if it allows only one file — so we must use [0].
Multer builds req.files like this 👇
req.files = {
  image1: [ fileObject ],
  image2: [ fileObject ]
}
So each field name (like image2,image3...) maps to an array of files.image1,image2... are Multer file object that contains metadata of the file (such as filename, path, size, mimetype etc.); the actual image is stored on disk at image1.path.
using only const image1 =req.files.image1[0]; can cause an error if the file input is empty (no file uploaded) because req.files.image1 would be undefined. To prevent this, we check if req.files.image1 exists before trying to access the first element.Only uploaded files appear in req.files. If a file input is empty, Multer does NOT create that key. so we use const image1 = req.files.image1 && req.files.image1[0]; to safely access the file object without risking an error when no file is uploaded. If image1 is not uploaded, it will be undefined instead of throwing an error.
How JS evaluates it
Check req.files.image1
If it exists → return req.files.image1[0]
If it doesn’t exist → return undefined
No crash. No error.
we dont store images or media in database directly. We store the path or URL of the image in the database. The actual image file is stored on disk or cloud storage.this because databases are optimized for structured data, not large binary files. Storing images directly in the database can lead to performance issues, increased storage costs, and complexity in data management. By storing only the path or URL, we keep the database lean and efficient while still being able to access the images when needed.db storage is expensive compared to file storage solutions like local disk storage, cloud services (e.g., AWS S3, Google Cloud Storage), or CDNs.If your image is stored on Cloudinary / S3 browser can cache it better and deliver faster to users.but if u store images apis return json with image paths/urls like {
  "name": "Shoe",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
and browser cannot cache such json objects or cahce them ineffectively.

short-circuit evaluation using the logical AND (&&) operator.this const image1 = req.files.image1 && req.files.image1[0]; means:Give me the first image only if image1 exists.Rule:A && B If A is falsy → return A. If A is truthy → return B.We use this pattern because multer only creates keys in req.files for fields that actually received files. If a field is missing, accessing it directly would throw an error.

.filter():loops through an array. runs a test function (found inside it) on each element of the array. keeps only the elements that pass the test.returns a NEW array.It never changes the original array.

map() returns an array.
forEach() vs map() — the CORE difference
🔹 forEach()
Used to do something with each item
❌ Does not create a new array
❌ Return value is always undefined
🔹 map()
Used to transform each item
✅ Creates and returns a new array
✅ Return value matters

📌 Golden rule
If you want a new array → use map()
If you just want to perform an action → use forEach()

When SHOULD you use forEach()?
✅ Mutating external variable (careful!)
let total = 0;
prices.forEach(price => total += price);
✅ DOM operations
buttons.forEach(btn => btn.disabled = true);

async= makes a function return a Promise.
await= makes an async function wait for a Promise.
aynsc/await allows us to write asynchronous code in a synchronous manner

callback function= A function passed into another function as an argument.a callback function run after the parent function has completed.
This allows us to ensure that a function is not going to run before a task is completed.but instead will run right after the task has completed.when passing a callback function as an argument to another function, don't use parentheses. Otherwise, the function will be invoked immediately instead of being passed as a reference.callbacks are used to handle asynchronous operations:readin file,network requests,interacting with databases... .

Every async function always returns a Promise(this default js behavior) — whether you write return, await, or nothing at all.eg.
images.map(async (item) => {
  return item.name;
});
// → returns array of Promises
// [ Promise {<fulfilled>: 'shoe1.png'}, Promise {<fulfilled>: 'shoe2.png'}, ... ]
If you put async before the arrow function inside .map()
→ you automatically get an array of promises
→ you must use Promise.all() if you want to wait for all of them to resolve before proceeding.here .map is used to transform each image file object into its corresponding Cloudinary URL asynchronously. Since each upload returns a Promise, we end up with an array of Promises that we can wait on using Promise.all() to get the final array of URLs once all uploads are complete.

const {productId} = req.body;//this is short form of const productId = req.body.productId; ES6 object destructuring

 eg.line 64 we never defined error object because on try catch block,if we give an argument for catch block, it automatically becomes the error object that contains details about the error that occurred in the try block. This is a built-in feature of JavaScript's error handling mechanism. The catch block captures any exceptions thrown in the try block and provides access to the error details through this parameter, allowing us to log it or send it back in the response as needed.

 const products = await productModel.find();//here we are fetching all products from database using mongoose find() beacause we dont give any filter to it. like id or category etc. so it will return all products. if we want to filter products by category then we can do like productModel.find({category: 'shoes'}) and it will return all products with category shoes. but here we want to return all products so we just do productModel.find() without any filter.

flow continued from productRoute.js:
Controller Runs
const removeProduct = async (req, res) => {
  await productModel.findByIdAndDelete(req.params.id);
}
Now:req.params.id === "abc123"
So MongoDB executes:Delete product where _id = "abc123"

 */

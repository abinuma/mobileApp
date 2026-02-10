import express from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct,
);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);

export default productRouter;

/*
Multer intercepts the request BEFORE addProduct runs. It processes the file uploads and makes them available in req.files.Multer parses the request.Multer:

    Reads the incoming stream
    Separates:
    Text fields → req.body

Controller gets clean data.Now addProduct(req, res) runs with files already processed.
There are two main storage options:

upload.fields() — why not single()?
Multer has multiple modes:

upload.single("image")
One file only
One field name

upload.array("images", 5)
Multiple files
Same field name

✅ upload.fields([...]) ← YOU USED THIS
Multiple files
Different field names:Perfect for products with multiple images
here why fields is used?
Because each image has a different field name (image1, image2, etc.), we use upload.fields() to handle multiple files with distinct names in a single request. This is ideal for scenarios like adding a product with several images, where each image needs to be uploaded separately but within the same form submission.

in upload.fields: we do .fields because upload is just multer instance.and we used .fields becuase we must tell multer exactly:
which field names to expect
how many files per field
Why you can’t just do upload alone.❌ This will NOT work:
productRouter.post("/add", upload, addProduct);Because:
Multer doesn’t know what fields to process
No file parsing happens
req.files will be undefined

*/

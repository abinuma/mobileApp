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
productRouter.delete("/:id", adminAuth, removeProduct);
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

prodcuRouter receives the flow from server.js:
productRouter Matches the Route:productRouter.delete("/:id", adminAuth, removeProduct);
What does /:id mean?It means:"Match ANY value after the slash and call it id"
Now Express automatically creates:
req.params = {
  id: "abc123"
  }
. now go to removeProduct function in productController.js. ----->productController.js
let us assume 
productRouter.delete("/:id", adminAuth, removeProduct);
productRouter.delete("/old", old);
productRouter.delete("/unused", unuse);
productRouter.delete("/purchased/completed", complet);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);
here
productRouter.delete("/:id", ...)
That means:“For ANY DELETE request with ONE path segment after /api/product, treat it as an id.”
for old express check from top to bottom
Method matches ✅
Path /old matches /:id ✅
then id = "old"
It stops here.It NEVER reaches:productRouter.delete("/old", old);So your /old route becomes useless it will never run.the same happens for productRouter.delete("/unused", unuse); .
but productRouter.delete("/purchased/completed", complet); will run successfully. because this has TWO segments:/purchased/completed .this doesnot match /:id because /:id only matches ONE segment. and the remainig ones are also not affected because they have different methods (post and get)
so to remove this professionaly we write static routes first and dynamic routes at the end.like this:
productRouter.delete("/old", old);
productRouter.delete("/unused", unuse);
productRouter.delete("/:id", removeProduct);
*/

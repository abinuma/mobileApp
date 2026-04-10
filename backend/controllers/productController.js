import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// function for add product
const addProduct = async (req, res) => {
  try {
    console.log("------------------------------------------");
    console.log("[Backend] addProduct called");
    console.log("[Backend] Headers (Auth Check):", { 
        token: req.headers.token ? "PRESENT" : "MISSING",
        contentType: req.headers['content-type']
    });
    console.log("[Backend] Request Body Fields:", Object.keys(req.body));
    console.log("[Backend] Request Files Keys:", req.files ? Object.keys(req.files) : "None");

    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    // Check if images are present
    const image1 = req.files?.image1 && req.files.image1[0];
    const image2 = req.files?.image2 && req.files.image2[0];
    const image3 = req.files?.image3 && req.files.image3[0];
    const image4 = req.files?.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );

    console.log(`[Backend] Images identified: ${images.length}`);

    if (images.length === 0) {
        console.warn("[Backend Warning] No images found in request files!");
    }

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        console.log(`[Backend] Uploading to Cloudinary... File: ${item.path}`);
        
        // Pass config directly to ensure it uses the correct credentials
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
          api_key: process.env.CLOUDINARY_API_KEY.trim(),
          api_secret: process.env.CLOUDINARY_SECRET_KEY.trim(),
          cloud_name: process.env.CLOUDINARY_NAME.trim()
        });
        
        console.log(`[Backend] Cloudinary Upload Success: ${result.secure_url}`);
        return result.secure_url;
      }),
    );

    const sizeOrder = [ "S", "M", "L", "XL", "XXL"];

    // parse sizes
    let parsedSizes = [];
    if (sizes) {
        try {
            parsedSizes = JSON.parse(sizes);
        } catch (e) {
            console.error("[Backend] Error parsing sizes:", e.message);
            parsedSizes = [];
        }
    }

    // sort according to predefined order
    if (Array.isArray(parsedSizes)) {
        parsedSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
    }

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: parsedSizes,
      image: imagesUrl,
      date: Date.now(),
    };

    console.log("[Backend] Database Write... Name:", name);

    const product = new productModel(productData);
    await product.save();
    
    console.log("[Backend Success] Product saved! ID:", product._id);
    console.log("------------------------------------------");
    res.json({ success: true, message: "Product added" });
  } catch (error) {
    console.log("[Backend Error] addProduct failed:", error.message);
    console.log("------------------------------------------");
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

import express from "express";
import { addToCart, getUserCart, updateCart } from "../controllers/cartController.js";
import authUser from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post('/get', authUser, getUserCart)
cartRouter.post('/update', authUser, updateCart)
cartRouter.post('/add', authUser, addToCart)

export default cartRouter;

/*
We create a route for:
Any functionality that must be triggered through an HTTP request.
You need a route when:
The client (frontend, mobile app, Postman, etc.) needs to access it over the network.

here http metohds: get,post,put are not syntaxcally required. You can technically use any method for any operation, but using the correct HTTP method is a best practice for clarity and convention. For example:

*/

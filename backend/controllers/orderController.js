import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";


//global variables
const currency = 'USD';
const deliveryCharge = 10;


//getway intialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing orders using COD method

const placeOrder = async (req,res) => {
    try {
        const userId = req.userId;
        const {items, amount, address} = req.body;

        const orderData = {
            userId,
            items,
            address ,
            amount ,
            paymentMethod: 'COD',
            payment: false,
            date : Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId,{cartData: {}})
        res.json({success: true, message: 'Order Placed'})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}
// placing orders using stripe method

const placeOrderStripe = async (req,res) => {
    try {
        const userId = req.userId;
        const {items, amount, address} = req.body;
        const {origin} = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'Stripe',
            payment: false,
            date : Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item)=>({
            price_data : {
                currency: currency,
                product_data: {
                    name: item.name,

                },  
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data : {
                currency: currency,
                product_data: {
                    name: "Delivery Charges",
                },  
                unit_amount: Math.round(deliveryCharge * 100)
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment'
        })

        res.json({success: true, session_url: session.url})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//verify stripe

const verifyStripe = async (req,res) => {
    const userId = req.userId;
    const {success, orderId} = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment: true})
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            res.json({success: true});
        } else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success: false})
        }
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//placing orders using razorpay method

const placeOrderRazorpay = async (req,res) => {
    try {
        
    } catch (error) {
        
    }
}

// All orders data for admin panel
const allOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success: true, orders})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}
// user order data for frontend
const userOrders = async (req,res) => {
    try {
        const userId = req.userId;
        const orders = await orderModel.find({userId});
        res.json({success: true, orders})
        // console.log(orders)
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//update order status from admin panel
const updateStatus = async (req,res) => {
    try {
        const {orderId, status} = req.body;
        await orderModel.findByIdAndUpdate(orderId, {status})
        res.json({success: true, message: 'Status Updated'})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export {verifyStripe,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus}

/*
Your backend uses the stripe secret key to request Stripe to create a payment session.
✅Stripe creates the session.
✅Stripe processes the payment through banks.
✅The customer pays on Stripe’s secure servers.
✅Stripe notifies your backend of the result.

key is used to:
👉 Authenticate your backend
👉 Authorize it to create/manage payments
Stripe is:A separate system. it is a global payment API
It only cares about:
👉How much to charge
👉What product name
👉Currency
👉Quantity

const { origin } = req.headers;
req.headers contains HTTP request headers sent by the browser.One of them is:
    Origin: http://localhost:5173
origin is NOT where Stripe was called from.It is the frontend domain that made the request to your backend.
Origin header only includes:
👉protocol + domain + port
It NEVER includes:
/api/order/stripe
/verify
Any path

unit_amount: deliveryCharge * 100
💳 Because Stripe expects the amount in the smallest currency unit.Stripe does NOT accept decimal currency values like:10.99
so if actual price is 10.99 USD, you need to convert it to cents by multiplying by 100, resulting in 1099 cents. which is stripe's unit_amount for 10.99 USD.Because Stripe requires integers, and any decimal like 1098.999999 will cause issues.
const session = await stripe.checkout.sessions.create({...})
This tells Stripe:“Create a hosted payment page for this order.”. Stripe then:Generates a secure checkout page,Handles card input,Handles validation.we don’t build the payment UI — Stripe does.

possible modes:
| Mode           | Purpose                    |
| -------------- | -------------------------- |
| `payment`      | One-time payment           |
| `subscription` | Monthly/recurring          |
| `setup`        | Save card without charging |

ancel_url and success_url are fixed Stripe parameter names.

*/
import userModel from "../models/userModel.js";

// add products to user cart
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    // const {userId,  itemId, size } = req.body;
    const { itemId, size } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "added to cart " });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//update user cart
const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size, quantity } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    cartData[itemId][size] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart updated " });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get user cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId);
    let cartData = userData.cartData;

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };

/*
Use DOT to access nested properties in JavaScript objects when the property name is Static, valid identifier.
Use BRACKET when:
Key is dynamic,Key starts with number,Key has spaces,Key comes from variable.

here the whole { success: true,  cartData } is the response data that the frontend receives and can access as response.data.success and response.data.cartData

*/

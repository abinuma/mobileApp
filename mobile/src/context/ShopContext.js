import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  // Professional configuration using .env (EXPO_PUBLIC_ prefix is required for Expo)
  const rawUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "https://crownwear-backend.vercel.app"; 
  const backendUrl = rawUrl.replace(/\/+$/, ""); // Safely remove trailing slashes to prevent // redirects
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");

  const addToCart = async (itemId, size) => {
    if (!size) {
      Alert.alert("Error", "Please select a product size");
      return;
    }

    let cartData = JSON.parse(JSON.stringify(cartItems));

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
    setCartItems(cartData);

    if (token) {
      try {
        console.log(`[API Call] Adding to cart: ${backendUrl}/api/cart/add`);
        const response = await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
        console.log('[API Success] Add to cart response:', response.data);
      } catch (error) {
        console.error('[API Error] Add to cart failed:', error.response?.data || error.message);
        Alert.alert("Error", error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = JSON.parse(JSON.stringify(cartItems));
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        console.log(`[API Call] Updating quantity: ${backendUrl}/api/cart/update`);
        const response = await axios.patch(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
        console.log('[API Success] Update quantity response:', response.data);
      } catch (error) {
        console.error('[API Error] Update quantity failed:', error.response?.data || error.message);
        Alert.alert("Error", error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo) {
        for (const item in cartItems[items]) {
          try {
            if (cartItems[items][item] > 0) {
              totalAmount += itemInfo.price * cartItems[items][item];
            }
          } catch (error) {}
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      console.log(`[API Call] Fetching products: ${backendUrl}/api/product/list`);
      const response = await axios.get(backendUrl + "/api/product/list");
      console.log('[API Success] Fetch products response:', response.data.success ? 'Success' : 'Failed');
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error('[API Error] Fetch products failed:', error.response?.data || error.message);
      Alert.alert("Error", error.message);
    }
  };

  const getUserCart = async (userToken) => {
    try {
      console.log(`[API Call] Fetching user cart: ${backendUrl}/api/cart/get`);
      const response = await axios.get(backendUrl + "/api/cart/get", {
        headers: { token: userToken },
      });
      console.log('[API Success] Fetch user cart response:', response.data.success ? 'Success' : 'Failed');
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.error('[API Error] Fetch user cart failed:', error.response?.data || error.message);
      Alert.alert("Error", error.message);
    }
    console.log('[Auth] Token set and user cart fetching initiated');
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      const localToken = await AsyncStorage.getItem("token");
      if (localToken) {
        setToken(localToken);
        getUserCart(localToken);
      }
    };
    loadToken();
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    backendUrl,
    setToken,
    token,
    setCartItems,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;

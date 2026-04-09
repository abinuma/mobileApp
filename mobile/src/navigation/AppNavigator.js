import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingBag, ShoppingCart, User, PlusCircle, List, ClipboardList } from 'lucide-react-native';
import { ShopContext } from '../context/ShopContext';

// Client Screens
import HomeScreen from '../screens/HomeScreen';
import CollectionScreen from '../screens/CollectionScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import LoginScreen from '../screens/LoginScreen';
import PlaceOrderScreen from '../screens/PlaceOrderScreen';
import OrdersScreen from '../screens/OrdersScreen';
import VerifyScreen from '../screens/VerifyScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';

// Admin Screens
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AddProductScreen from '../screens/admin/AddProductScreen';
import ListProductsScreen from '../screens/admin/ListProductsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- SHARED CLIENT SCREENS (Common to all tabs) ---
const commonScreens = (Stack) => (
  <>
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="PlaceOrder" component={PlaceOrderScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
    <Stack.Screen name="Verify" component={VerifyScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Contact" component={ContactScreen} />
  </>
);

// --- CLIENT NAVIGATION ---
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    {commonScreens(Stack)}
  </Stack.Navigator>
);

const CollectionStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CollectionMain" component={CollectionScreen} />
    {commonScreens(Stack)}
  </Stack.Navigator>
);

const CartStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      {commonScreens(Stack)}
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={LoginScreen} />
      {commonScreens(Stack)}
    </Stack.Navigator>
);

const MainTabs = () => {
  const { getCartCount } = useContext(ShopContext);
  const cartCount = getCartCount();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Collection') return <ShoppingBag color={color} size={size} />;
          if (route.name === 'Cart') return <ShoppingCart color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Collection" component={CollectionStack} />
      <Tab.Screen 
        name="Cart" 
        component={CartStack} 
        options={{ 
          tabBarBadge: cartCount > 0 ? cartCount : null,
          tabBarBadgeStyle: { 
            backgroundColor: '#000', 
            color: '#fff',
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            lineHeight: 14,
            textAlign: 'center'
          }
        }} 
      />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

// --- ADMIN NAVIGATION ---
const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Add Product') return <PlusCircle color={color} size={size} />;
        if (route.name === 'List Products') return <List color={color} size={size} />;
        if (route.name === 'Admin Orders') return <ClipboardList color={color} size={size} />;
      },
      tabBarActiveTintColor: '#f97316',
      tabBarInactiveTintColor: 'gray',
      headerStyle: { backgroundColor: '#f9fafb' },
      headerTitleStyle: { fontWeight: 'bold' }
    })}
  >
    <Tab.Screen name="Add Product" component={AddProductScreen} />
    <Tab.Screen name="List Products" component={ListProductsScreen} />
    <Tab.Screen name="Admin Orders" component={AdminOrdersScreen} />
  </Tab.Navigator>
);

// --- ROOT NAVIGATOR ---
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Client App Flow */}
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        
        {/* Admin Dashboard */}
        <Stack.Screen 
           name="AdminDashboard" 
           component={AdminTabs} 
           options={{ gestureEnabled: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import axios from 'axios';

const PlaceOrderScreen = ({ navigation }) => {
    const [method, setMethod] = useState('cod');
    const { backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: "",
    });

    const onchangeHandler = (name, value) => {
        setFormData(data => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async () => {
        if (!token) {
            Alert.alert("Error", "Please login to place an order");
            return;
        }

        // Basic Validation
        for (const key in formData) {
            if (!formData[key]) {
                Alert.alert("Error", `Please fill in the ${key} field.`);
                return;
            }
        }

        setLoading(true);
        try {
            let orderItems = [];
            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = products.find((product) => product._id === items);
                        if (itemInfo) {
                            const itemClone = JSON.parse(JSON.stringify(itemInfo));
                            itemClone.size = item;
                            itemClone.quantity = cartItems[items][item];
                            orderItems.push(itemClone);
                        }
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee,
            };

            switch (method) {
                case "cod":
                    const response = await axios.post(
                        backendUrl + "/api/order/place",
                        orderData,
                        { headers: { token } } // matched standardized header
                    );
                    if (response.data.success) {
                        setCartItems({});
                        Alert.alert("Success", "Order placed successfully!");
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Orders' }],
                        });
                    } else {
                        Alert.alert("Error", response.data.message);
                    }
                    break;

               case "stripe":
    const responseStripe = await axios.post(
        backendUrl + "/api/order/stripe", 
        orderData, 
        { headers: { token } }
    );
    if (responseStripe.data.success) {
        const { session_url } = responseStripe.data;
        // Navigate to a WebView screen with the session URL
        navigation.navigate('StripeWebView', { session_url, orderData });
    }
    break;
                default:
                    break;
            }

        } catch (error) {
            console.log(error);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.titleContainer}>
                        <Title text1="DELIVERY" text2="INFORMATION" />
                    </View>

                    <View style={styles.row}>
                        <TextInput
                            mode="outlined"
                            label="First name"
                            value={formData.firstName}
                            onChangeText={(val) => onchangeHandler("firstName", val)}
                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                        />
                        <TextInput
                            mode="outlined"
                            label="Last name"
                            value={formData.lastName}
                            onChangeText={(val) => onchangeHandler("lastName", val)}
                            style={[styles.input, { flex: 1 }]}
                        />
                    </View>

                    <TextInput
                        mode="outlined"
                        label="Email address"
                        keyboardType="email-address"
                        value={formData.email}
                        onChangeText={(val) => onchangeHandler("email", val)}
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label="Street"
                        value={formData.street}
                        onChangeText={(val) => onchangeHandler("street", val)}
                        style={styles.input}
                    />

                    <View style={styles.row}>
                        <TextInput
                            mode="outlined"
                            label="City"
                            value={formData.city}
                            onChangeText={(val) => onchangeHandler("city", val)}
                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                        />
                        <TextInput
                            mode="outlined"
                            label="State"
                            value={formData.state}
                            onChangeText={(val) => onchangeHandler("state", val)}
                            style={[styles.input, { flex: 1 }]}
                        />
                    </View>

                    <View style={styles.row}>
                        <TextInput
                            mode="outlined"
                            label="Zipcode"
                            keyboardType="numeric"
                            value={formData.zipcode}
                            onChangeText={(val) => onchangeHandler("zipcode", val)}
                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                        />
                        <TextInput
                            mode="outlined"
                            label="Country"
                            value={formData.country}
                            onChangeText={(val) => onchangeHandler("country", val)}
                            style={[styles.input, { flex: 1 }]}
                        />
                    </View>

                    <TextInput
                        mode="outlined"
                        label="Phone"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(val) => onchangeHandler("phone", val)}
                        style={styles.input}
                    />

                    <View style={styles.totalSection}>
                        <CartTotal />
                    </View>

                    <View style={styles.paymentSection}>
                        <Title text1="PAYMENT" text2="METHOD" />
                        <View style={styles.paymentOptions}>
                            <TouchableOpacity 
                                style={[styles.methodBox, method === 'stripe' && styles.methodBoxActive]}
                                onPress={() => setMethod('stripe')}
                            >
                                <View style={[styles.radio, method === 'stripe' && styles.radioActive]} />
                                <Text style={styles.methodText}>STRIPE</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.methodBox, method === 'cod' && styles.methodBoxActive]}
                                onPress={() => setMethod('cod')}
                            >
                                <View style={[styles.radio, method === 'cod' && styles.radioActive]} />
                                <Text style={styles.methodText}>CASH ON DELIVERY</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Button 
                        mode="contained" 
                        onPress={onSubmitHandler} 
                        loading={loading}
                        disabled={loading}
                        style={styles.placeOrderBtn}
                        contentStyle={styles.btnContent}
                    >
                        {loading ? "PLACING ORDER..." : "PLACE ORDER"}
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    titleContainer: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    totalSection: {
        marginTop: 24,
    },
    paymentSection: {
        marginTop: 32,
    },
    paymentOptions: {
        marginTop: 12,
        gap: 12,
    },
    methodBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 12,
        borderRadius: 4,
    },
    methodBoxActive: {
        borderColor: '#10b981', // green-500
        backgroundColor: '#f0fdf4',
    },
    radio: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#9ca3af',
        marginRight: 12,
    },
    radioActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    methodText: {
        fontWeight: '500',
        color: '#4b5563',
    },
    placeOrderBtn: {
        backgroundColor: '#000',
        marginTop: 32,
        borderRadius: 4,
    },
    btnContent: {
        paddingVertical: 8,
    },
});

export default PlaceOrderScreen;

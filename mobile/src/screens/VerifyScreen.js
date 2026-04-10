import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

const VerifyScreen = ({ route, navigation }) => {
    const { backendUrl, token, setCartItems } = useContext(ShopContext);
    const { success, orderId } = route.params || {};

    const verifyPayment = async () => {
        try {
            if (!token) return;

            // If no params, redirect to Home immediately
            if (!success || !orderId) {
                navigation.replace('Main');
                return;
            }

            const response = await axios.post(
                backendUrl + "/api/order/verifyStripe",
                { success, orderId },
                { headers: { token } }
            );

            if (response.data.success) {
                setCartItems({});
                Alert.alert("Success", "Payment verified successfully!");
                navigation.replace('Orders');
            } else {
                Alert.alert("Failed", "Payment verification failed.");
                navigation.replace('Cart');
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", error.message);
            navigation.replace('Cart');
        }
    };

    useEffect(() => {
        verifyPayment();
    }, [token]);

    return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.text}>Verifying Payment...</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: '#4b5563',
    },
});

export default VerifyScreen;

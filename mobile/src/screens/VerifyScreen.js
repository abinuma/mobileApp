import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { ShopContext } from '../context/ShopContext';
import InlineBanner from '../components/InlineBanner';
import axios from 'axios';

const VerifyScreen = ({ route, navigation }) => {
    const { backendUrl, token, setCartItems } = useContext(ShopContext);
    const { success, orderId } = route.params || {};
    const [statusMessage, setStatusMessage] = useState(null);
    const [statusType, setStatusType] = useState('info');

    // Helper: fully reset the app to a specific tab, optionally with a screen pushed on top
    const resetToTab = (tabName, pushScreen) => {
        const homeState = { screens: { HomeMain: undefined } };
        const cartState = { screens: { CartMain: undefined } };

        const tabStates = {
            Home: homeState,
            Cart: cartState,
        };

        // Build the state for the target tab
        const targetTabState = tabStates[tabName] || homeState;

        // If we need to push a screen (e.g., Orders) on top of a tab
        if (pushScreen) {
            targetTabState.screens[pushScreen] = undefined;
        }

        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{
                    name: 'Main',
                    state: {
                        routes: [
                            { name: tabName, state: { routes: Object.keys(targetTabState.screens).map(s => ({ name: s })) } }
                        ],
                    },
                }],
            })
        );
    };

    const verifyPayment = async () => {
        try {
            if (!token) return;

            // If no params, redirect to Home immediately
            if (!success || !orderId) {
                resetToTab('Home');
                return;
            }

            // If explicit cancellation, clean up backend and go to Cart
            if (success === 'false') {
                try {
                    await axios.post(backendUrl + "/api/order/verifyStripe", { success, orderId }, { headers: { token } });
                } catch (e) {
                    console.log("Cleanup error:", e.message);
                }
                setStatusMessage("Payment was cancelled.");
                setStatusType("warning");
                setTimeout(() => resetToTab('Cart'), 1500);
                return;
            }

            const response = await axios.post(
                backendUrl + "/api/order/verifyStripe",
                { success, orderId },
                { headers: { token } }
            );

            if (response.data.success) {
                setCartItems({});
                setStatusMessage("Payment verified successfully! 🎉");
                setStatusType("success");
                setTimeout(() => resetToTab('Home', 'Orders'), 1500);
            } else {
                setStatusMessage("Payment verification failed. Please contact support.");
                setStatusType("error");
                setTimeout(() => resetToTab('Cart'), 2500);
            }
        } catch (error) {
            console.log(error);
            setStatusMessage(error.message || "Verification error. Please try again.");
            setStatusType("error");
            setTimeout(() => resetToTab('Cart'), 2500);
        }
    };

    useEffect(() => {
        verifyPayment();
    }, [token]);

    return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.text}>Verifying Payment...</Text>
            
            {/* Inline status message */}
            {statusMessage && (
                <View style={{ marginTop: 24, width: '100%', paddingHorizontal: 24 }}>
                    <InlineBanner 
                        message={statusMessage} 
                        type={statusType} 
                        onDismiss={() => setStatusMessage(null)}
                        autoDismiss={0}
                    />
                </View>
            )}
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

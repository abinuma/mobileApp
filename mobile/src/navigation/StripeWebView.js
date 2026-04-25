import React, { useRef, useContext, useEffect } from 'react';
import { Platform, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const StripeWebView = ({ route }) => {
  const { session_url, orderData } = route.params;
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const { token, backendUrl, setCartItems } = useContext(ShopContext);

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;
    if (url.includes('/verify')) {
      // Extract success and orderId from URL
      const params = new URLSearchParams(url.split('?')[1]);
      const success = params.get('success');
      const orderId = params.get('orderId');

      // Stop loading and close WebView
      webViewRef.current?.stopLoading();
      navigation.goBack();

      // Now call the verify endpoint
      if (success === 'true') {
        try {
          const response = await axios.post(
            `${backendUrl}/api/order/verifyStripe`,
            { success, orderId },
            { headers: { token } }
          );
          if (response.data.success) {
            setCartItems({});
            // Navigate to Orders — success handled by VerifyScreen or OrdersScreen
            navigation.navigate('Orders');
          }
        } catch (error) {
          console.error('[StripeWebView] Verification failed:', error.message);
        }
      }
      // Cancellation is handled silently — user returns to previous screen
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log("Web platform detected, redirecting to Stripe...");
      // For web, we redirect the entire page to Stripe
      window.location.href = session_url;
    }
  }, [session_url]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.webText}>Redirecting to secure payment...</Text>
        <Text style={styles.subText}>Please wait while we transfer you to Stripe.</Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: session_url }}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState
    />
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  webText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  subText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default StripeWebView;
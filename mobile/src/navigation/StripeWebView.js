import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const StripeWebView = ({ route }) => {
  const { session_url, orderData } = route.params;
  const navigation = useNavigation();
  const webViewRef = useRef(null);

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
                    const { token } = req.headers;

          const response = await axios.patch(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/order/verifyStripe`,
            { success, orderId },
            { headers: { token: token} }
          );
          if (response.data.success) {
            Alert.alert('Success', 'Payment successful!');
            navigation.navigate('Orders');
          }
        } catch (error) {
          Alert.alert('Error', 'Verification failed');
        }
      } else {
        Alert.alert('Cancelled', 'Payment was cancelled.');
      }
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: session_url }}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState
    />
  );
};

export default StripeWebView;
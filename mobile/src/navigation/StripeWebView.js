import React, { useRef, useContext } from 'react';
import { Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const StripeWebView = ({ route }) => {
  const { session_url, orderData } = route.params;
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const { token, backendUrl } = useContext(ShopContext);

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
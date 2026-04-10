import React, { useRef, useContext, useEffect } from 'react';
import { Alert, Platform, Linking, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
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

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Direct redirect on web
      window.location.href = session_url;
    }
  }, [session_url]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.webText}>Redirecting to payment gateway...</Text>
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
  },
  webText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4b5563',
  },
});

export default StripeWebView;
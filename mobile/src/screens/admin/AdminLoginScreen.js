import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShopContext } from '../../context/ShopContext';
import { AlertCircle, X } from 'lucide-react-native';

// --- Inline Error Banner ---
const ErrorBanner = ({ message, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        if (onDismiss) onDismiss();
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View style={[errorStyles.container, { opacity: fadeAnim }]}>
      <AlertCircle color="#991b1b" size={18} style={{ marginRight: 8 }} />
      <Text style={errorStyles.text} numberOfLines={3}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <X color="#991b1b" size={16} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const errorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  text: { flex: 1, fontSize: 13, lineHeight: 18, color: '#991b1b' },
});

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { backendUrl } = useContext(ShopContext);

  const showError = (msg) => {
    setErrorMsg('');
    setTimeout(() => setErrorMsg(msg), 50);
  };

  const clearError = () => setErrorMsg('');

  const handleLogin = async () => {
    clearError();

    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    try {
      console.log(`[API Call] Admin login: ${backendUrl}/api/user/admin`);
      const response = await axios.post(`${backendUrl}/api/user/admin`, { email, password });
      console.log('[API Success] Admin login response:', response.data.success);
      
      if (response.data.success) {
        // Successful login
        await AsyncStorage.setItem('adminToken', response.data.token);
        // Navigate to Admin Dashboard (ListProducts or AddProduct)
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' }],
        });
      } else {
        const raw = response.data.message;
        if (raw === 'Invalid credentials') {
          showError('Incorrect admin email or password. Please try again.');
        } else {
          showError(raw || 'Admin login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('[API Error] Admin login failed:', error.response?.data || error.message);
      const rawMsg = error.response?.data?.message || error.message;
      if (rawMsg.includes('Network Error')) {
        showError('Unable to connect to server. Check your internet connection.');
      } else {
        showError(rawMsg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Admin Panel</Text>

          {/* Inline error banner */}
          <ErrorBanner message={errorMsg} onDismiss={clearError} />
          
          <TextInput
            mode="outlined"
            label="Admin Email Address"
            style={styles.input}
            value={email}
            onChangeText={(t) => { clearError(); setEmail(t); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            mode="outlined"
            label="Password"
            style={styles.input}
            value={password}
            onChangeText={(t) => { clearError(); setPassword(t); }}
            secureTextEntry
          />

          <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={{ paddingVertical: 8 }}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: 8 }}
          >
            Back to User Site
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }
    })
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#000',
    borderRadius: 4,
  },
});

export default AdminLoginScreen;

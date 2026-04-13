import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShopContext } from '../../context/ShopContext';
import InlineBanner, { useInlineBanner } from '../../components/InlineBanner';

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { backendUrl } = useContext(ShopContext);
  const { banner, showBanner, clearBanner } = useInlineBanner();

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleLogin = async () => {
    clearBanner();

    // Validate and highlight
    const errors = {};
    const missing = [];
    if (!email.trim()) { errors.email = true; missing.push('Email'); }
    if (!password.trim()) { errors.password = true; missing.push('Password'); }

    if (missing.length > 0) {
      setFieldErrors(errors);
      showBanner(`Please enter ${missing.join(' and ').toLowerCase()}.`, 'error');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      console.log(`[API Call] Admin login: ${backendUrl}/api/user/admin`);
      const response = await axios.post(`${backendUrl}/api/user/admin`, { email, password });
      console.log('[API Success] Admin login response:', response.data.success);
      
      if (response.data.success) {
        await AsyncStorage.setItem('adminToken', response.data.token);
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' }],
        });
      } else {
        const raw = response.data.message;
        if (raw === 'Invalid credentials') {
          showBanner('Incorrect admin email or password. Please try again.');
        } else {
          showBanner(raw || 'Admin login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('[API Error] Admin login failed:', error.response?.data || error.message);
      const rawMsg = error.response?.data?.message || error.message;
      if (rawMsg.includes('Network Error')) {
        showBanner('Unable to connect to server. Check your internet connection.');
      } else {
        showBanner(rawMsg || 'Something went wrong. Please try again.');
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

          {/* Inline banner */}
          <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />
          
          <TextInput
            mode="outlined"
            label="Admin Email Address"
            style={styles.input}
            value={email}
            onChangeText={(t) => { clearBanner(); clearFieldError('email'); setEmail(t); }}
            autoCapitalize="none"
            keyboardType="email-address"
            outlineColor={fieldErrors.email ? '#ef4444' : undefined}
            activeOutlineColor={fieldErrors.email ? '#ef4444' : '#000'}
            error={fieldErrors.email}
          />
          
          <TextInput
            mode="outlined"
            label="Password"
            style={styles.input}
            value={password}
            onChangeText={(t) => { clearBanner(); clearFieldError('password'); setPassword(t); }}
            secureTextEntry
            outlineColor={fieldErrors.password ? '#ef4444' : undefined}
            activeOutlineColor={fieldErrors.password ? '#ef4444' : '#000'}
            error={fieldErrors.password}
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

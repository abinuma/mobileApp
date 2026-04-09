import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShopContext } from '../../context/ShopContext';

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { backendUrl } = useContext(ShopContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
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
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('[API Error] Admin login failed:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || error.message);
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
          
          <TextInput
            mode="outlined"
            label="Admin Email Address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            mode="outlined"
            label="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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

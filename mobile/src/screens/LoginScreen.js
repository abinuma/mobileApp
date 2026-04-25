import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator as RNActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, Button, Avatar, List, Divider } from 'react-native-paper';
import { Settings, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react-native';
import InlineBanner, { useInlineBanner } from '../components/InlineBanner';



const LoginScreen = ({ navigation }) => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, backendUrl, setCartItems } = useContext(ShopContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { banner, showBanner, clearBanner } = useInlineBanner();

  // Logout functionality
  const logout = async () => {
    setLogoutLoading(true);
    try {
      await AsyncStorage.removeItem('token');
      setToken('');
      setCartItems({});
      showBanner("You have been logged out.", 'success');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const onSubmitHandler = async () => {
    clearBanner();

    // Validate and highlight fields
    const errors = {};
    if (!email.trim()) errors.email = true;
    if (!password.trim()) errors.password = true;
    if (currentState === 'Sign Up' && !name.trim()) errors.name = true;

    if (errors.email || errors.password || errors.name) {
      setFieldErrors(errors);
      if (errors.email && errors.password) {
        showBanner('Please enter both email and password.');
      } else if (errors.email) {
        showBanner('Please enter your email address.');
      } else if (errors.password) {
        showBanner('Please enter your password.');
      } else if (errors.name) {
        showBanner('Please enter your name.');
      }
      return;
    }

    setFieldErrors({});

    // Client-side email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showBanner('Please enter a valid email address.');
      return;
    }

    // Client-side password length check
    if (currentState === 'Sign Up' && password.length < 4) {
      showBanner('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    
    try {
      // 1. ADMIN INTERCEPTION LOGIC (Quick login for admin email)
      if (currentState === 'Login' && email === 'admin@abinu.com') {
          const response = await axios.post(backendUrl + '/api/user/admin', { email, password });
          if (response.data.success) {
            await AsyncStorage.setItem('adminToken', response.data.token);
            // Navigate straight to Admin Dashboard
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminDashboard' }],
            });
          } else {
            showBanner(response.data.message || 'Admin login failed.');
          }
          setLoading(false);
          return;
      }

      // 2. STANDARD USER LOGIC
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password });
        if (response.data.success) {
          setToken(response.data.token);
          await AsyncStorage.setItem('token', response.data.token);
          showBanner("Account created successfully! Welcome aboard.", 'success');
        } else {
          showBanner(response.data.message || 'Registration failed.');
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          await AsyncStorage.setItem('token', response.data.token);
        } else {
          showBanner(response.data.message || 'Login failed.');
        }
      }
    } catch (error) {
      const rawMsg = error.response?.data?.message || error.message;
      showBanner(rawMsg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGGED IN (PROFILE) VIEW ---
  if (token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Avatar.Text size={80} label="U" style={{ backgroundColor: '#000' }} />
            <Text style={styles.profileName}>My Account</Text>
            <Text style={styles.profileEmail}>Manage your profile and orders</Text>
          </View>

          {/* Profile banner (e.g. logout success) */}
          {banner.message ? (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />
            </View>
          ) : null}

          <View style={styles.menuSection}>
             <List.Item
              title="My Orders"
              left={props => <ShoppingBag color="#000" size={20} style={{ marginTop: 10 }} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Orders')}
              style={styles.menuItem}
            />
            <Divider />
            <List.Item
              title="Admin Panel"
              description="Switch to store management"
              left={props => <ShieldCheck color="#f97316" size={20} style={{ marginTop: 10 }} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('AdminLogin')}
              style={styles.menuItem}
            />
            <Divider />
            <List.Item
              title="About Us"
              left={props => <Avatar.Icon size={24} icon="information-outline" style={{ backgroundColor: 'transparent', marginTop: 8 }} color="#4b5563" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('About')}
              style={styles.menuItem}
            />
            <Divider />
            <List.Item
              title="Contact Us"
              left={props => <Avatar.Icon size={24} icon="headset" style={{ backgroundColor: 'transparent', marginTop: 8 }} color="#4b5563" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Contact')}
              style={styles.menuItem}
            />
            <Divider />
            <List.Item
              title="Settings"
              left={props => <Settings color="#6b7280" size={20} style={{ marginTop: 10 }} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => showBanner("Settings coming soon!", "info")}
              style={styles.menuItem}
            />
            <Divider />
            <List.Item
              title={logoutLoading ? "Logging out..." : "Logout"}
              titleStyle={{ color: '#ef4444' }}
              left={props => logoutLoading 
                ? <RNActivityIndicator size={20} color="#ef4444" style={{ marginTop: 10 }} />
                : <LogOut color="#ef4444" size={20} style={{ marginTop: 10 }} />
              }
              onPress={logout}
              disabled={logoutLoading}
              style={styles.menuItem}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- LOGGED OUT (AUTH) VIEW ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{currentState}</Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* Inline error/success banner */}
          <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />

          {currentState !== 'Login' && (
            <TextInput
              mode="outlined"
              label="Name"
              style={styles.input}
              value={name}
              onChangeText={(t) => { clearBanner(); clearFieldError('name'); setName(t); }}
              outlineColor={fieldErrors.name ? '#ef4444' : undefined}
              activeOutlineColor={fieldErrors.name ? '#ef4444' : '#000'}
              error={fieldErrors.name}
            />
          )}

          <TextInput
            mode="outlined"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={(t) => { clearBanner(); clearFieldError('email'); setEmail(t); }}
            outlineColor={fieldErrors.email ? '#ef4444' : undefined}
            activeOutlineColor={fieldErrors.email ? '#ef4444' : '#000'}
            error={fieldErrors.email}
          />

          <TextInput
            mode="outlined"
            label="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={(t) => { clearBanner(); clearFieldError('password'); setPassword(t); }}
            outlineColor={fieldErrors.password ? '#ef4444' : undefined}
            activeOutlineColor={fieldErrors.password ? '#ef4444' : '#000'}
            error={fieldErrors.password}
          />

          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => showBanner('Forgot password feature coming soon!', 'info')}>
              <Text style={styles.linkTextMuted}>Forgot your password?</Text>
            </TouchableOpacity>
            {currentState === 'Login' ? (
              <TouchableOpacity onPress={() => { clearBanner(); setCurrentState('Sign Up'); }}>
                <Text style={styles.linkTextBold}>Create account</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { clearBanner(); setCurrentState('Login'); }}>
                <Text style={styles.linkTextBold}>Login Here</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            mode="contained"
            style={styles.actionBtn}
            contentStyle={styles.actionBtnContent}
            onPress={onSubmitHandler}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <RNActivityIndicator size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {currentState === 'Login' ? 'Signing In...' : 'Creating Account...'}
                </Text>
              </View>
            ) : (
              currentState === 'Login' ? 'Sign In' : 'Sign Up'
            )}
          </Button>

          <TouchableOpacity 
            style={styles.adminLink} 
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.adminLinkText}>Switch to Admin Panel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: '6%',
    paddingVertical: 48,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  titleText: {
    fontSize: 32,
    color: '#1f2937',
    marginRight: 8,
  },
  titleUnderline: {
    height: 1.5,
    width: 32,
    backgroundColor: '#1f2937',
  },
  input: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  linkRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: -8,
  },
  linkTextMuted: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#1f2937',
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: '#000000',
    borderRadius: 0,
    width: '100%',
  },
  actionBtnContent: {
    paddingVertical: 8,
  },
  adminLink: {
    marginTop: 24,
    padding: 10,
  },
  adminLinkText: {
    color: '#4b5563',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  // Profile Styles
  profileContainer: {
    flexGrow: 1,
    paddingVertical: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#111827',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    paddingVertical: 8,
  }
});

export default LoginScreen;


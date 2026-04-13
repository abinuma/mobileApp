import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, Button, Avatar, List, Divider } from 'react-native-paper';
import { Settings, LogOut, ShieldCheck, ShoppingBag, AlertCircle, CheckCircle, X } from 'lucide-react-native';
import SharedInlineBanner, { useInlineBanner } from '../components/InlineBanner';

// --- Map raw backend messages to user-friendly messages ---
const friendlyMessages = {
  // Login errors
  "User doesn't exist":        "No account found with this email. Please sign up first.",
  "Invalid credentials":       "Incorrect password. Please try again.",
  // Registration errors
  "User already exists":       "An account with this email already exists. Try logging in.",
  "Please enter a valid email": "The email address you entered is not valid.",
  "Please enter a strong password": "Password is too short. Use at least 4 characters.",
};

const getFriendlyMessage = (raw) => {
  if (!raw) return "Something went wrong. Please try again.";
  return friendlyMessages[raw] || raw;
};

// --- Inline Banner Component ---
const InlineBanner = ({ message, type, onDismiss }) => {
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

  const isError = type === 'error';
  return (
    <Animated.View style={[
      bannerStyles.container,
      isError ? bannerStyles.errorBg : bannerStyles.successBg,
      { opacity: fadeAnim },
    ]}>
      {isError
        ? <AlertCircle color="#991b1b" size={18} style={{ marginRight: 8 }} />
        : <CheckCircle color="#166534" size={18} style={{ marginRight: 8 }} />
      }
      <Text style={[bannerStyles.text, isError ? bannerStyles.errorText : bannerStyles.successText]} numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <X color={isError ? '#991b1b' : '#166534'} size={16} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const bannerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBg: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  successBg: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: { color: '#991b1b' },
  successText: { color: '#166534' },
});

const LoginScreen = ({ navigation }) => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, backendUrl, setCartItems } = useContext(ShopContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Banner state
  const [banner, setBanner] = useState({ message: '', type: 'error' }); // type: 'error' | 'success'

  const showBanner = (message, type = 'error') => {
    setBanner({ message: '', type }); // reset to re-trigger animation
    setTimeout(() => setBanner({ message, type }), 50);
  };

  const clearBanner = () => setBanner({ message: '', type: 'error' });

  // Logout functionality
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken('');
      setCartItems({});
      showBanner("You have been logged out.", 'success');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const onSubmitHandler = async () => {
    clearBanner();

    if (!email || !password) {
      showBanner('Please enter both email and password.');
      return;
    }

    if (currentState === 'Sign Up' && !name) {
      showBanner('Please enter your name.');
      return;
    }

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
          console.log(`[Diagnostic] Admin login attempt for: ${email} at ${backendUrl}/api/user/admin`);
          const response = await axios.post(backendUrl + '/api/user/admin', { email, password });
          console.log('[Diagnostic Result] Admin login success:', response.data.success, "| Message:", response.data.message);
          if (response.data.success) {
            await AsyncStorage.setItem('adminToken', response.data.token);
            // Navigate straight to Admin Dashboard
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminDashboard' }],
            });
          } else {
            showBanner(getFriendlyMessage(response.data.message));
          }
          setLoading(false);
          return;
      }

      // 2. STANDARD USER LOGIC
      if (currentState === 'Sign Up') {
        console.log(`[Diagnostic] Registering user: ${name} (${email}) at ${backendUrl}/api/user/register`);
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password });
        console.log('[Diagnostic Result] Registration status:', response.data.success, "| Message:", response.data.message);
        if (response.data.success) {
          setToken(response.data.token);
          await AsyncStorage.setItem('token', response.data.token);
          showBanner("Account created successfully! Welcome aboard.", 'success');
        } else {
          showBanner(getFriendlyMessage(response.data.message));
        }
      } else {
        console.log(`[Diagnostic] User login attempt: ${email} at ${backendUrl}/api/user/login`);
        const response = await axios.post(backendUrl + '/api/user/login', { email, password });
        console.log('[Diagnostic Result] Login status:', response.data.success, "| Message:", response.data.message);
        if (response.data.success) {
          setToken(response.data.token);
          await AsyncStorage.setItem('token', response.data.token);
        } else {
          showBanner(getFriendlyMessage(response.data.message));
        }
      }
    } catch (error) {
      console.error('[API Error] submission failed:', error.response?.data || error.message);
      const rawMsg = error.response?.data?.message || error.message;
      // Network / server errors
      if (rawMsg.includes('Network Error')) {
        showBanner("Unable to connect to server. Check your internet connection.");
      } else if (rawMsg.includes('timeout')) {
        showBanner("Request timed out. Please try again.");
      } else {
        showBanner(getFriendlyMessage(rawMsg));
      }
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
              onPress={() => {
                console.log('[Navigation] Navigating to My Orders from Profile');
                navigation.navigate('Orders');
              }}
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
              title="Logout"
              titleStyle={{ color: '#ef4444' }}
              left={props => <LogOut color="#ef4444" size={20} style={{ marginTop: 10 }} />}
              onPress={logout}
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
              onChangeText={(t) => { clearBanner(); setName(t); }}
            />
          )}

          <TextInput
            mode="outlined"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={(t) => { clearBanner(); setEmail(t); }}
          />

          <TextInput
            mode="outlined"
            label="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={(t) => { clearBanner(); setPassword(t); }}
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
            loading={loading}
          >
            {loading 
              ? (currentState === 'Login' ? 'SIGNING IN...' : 'SIGNING UP...') 
              : (currentState === 'Login' ? 'Sign In' : 'Sign Up')
            }
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


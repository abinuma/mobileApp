import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react-native';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_DURATION = 4000;

const TOAST_CONFIG = {
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    Icon: AlertCircle,
  },
  success: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    text: '#166534',
    Icon: CheckCircle,
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    Icon: AlertTriangle,
  },
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    Icon: Info,
  },
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback((message, type = 'error') => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Reset position immediately
    translateY.setValue(-100);
    opacity.setValue(0);

    // Set new toast
    setToast({ message, type });

    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Auto-hide
    timerRef.current = setTimeout(() => {
      hideToast();
    }, TOAST_DURATION);
  }, [translateY, opacity, hideToast]);

  const config = toast ? TOAST_CONFIG[toast.type] || TOAST_CONFIG.error : null;
  const IconComponent = config?.Icon;

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: config.bg,
              borderColor: config.border,
              transform: [{ translateY }],
              opacity,
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.toastContent}>
            <IconComponent color={config.text} size={20} style={styles.icon} />
            <Text style={[styles.toastText, { color: config.text }]} numberOfLines={3}>
              {toast.message}
            </Text>
            <TouchableOpacity
              onPress={hideToast}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <X color={config.text} size={16} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 12,
    borderWidth: 1,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
    flexShrink: 0,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeBtn: {
    marginLeft: 10,
    padding: 2,
  },
});

export default ToastContext;

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react-native';

/**
 * Reusable inline banner for error/success/warning/info messages.
 * Usage:
 *   <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />
 * 
 * Types: 'error' | 'success' | 'warning' | 'info'
 */

const BANNER_CONFIG = {
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

const InlineBanner = ({ message, type = 'error', onDismiss, autoDismiss = 5000 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          if (onDismiss) onDismiss();
        });
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) return null;

  const config = BANNER_CONFIG[type] || BANNER_CONFIG.error;
  const IconComp = config.Icon;

  return (
    <Animated.View style={[
      styles.container,
      { backgroundColor: config.bg, borderColor: config.border, opacity: fadeAnim },
    ]}>
      <IconComp color={config.text} size={18} style={{ marginRight: 8 }} />
      <Text style={[styles.text, { color: config.text }]} numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <X color={config.text} size={16} />
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Custom hook for managing inline banner state.
 * Returns: { banner, showBanner, clearBanner }
 */
export const useInlineBanner = () => {
  const [banner, setBanner] = React.useState({ message: '', type: 'error' });

  const showBanner = (message, type = 'error') => {
    setBanner({ message: '', type }); // reset to re-trigger animation
    setTimeout(() => setBanner({ message, type }), 50);
  };

  const clearBanner = () => setBanner({ message: '', type: 'error' });

  return { banner, showBanner, clearBanner };
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default InlineBanner;

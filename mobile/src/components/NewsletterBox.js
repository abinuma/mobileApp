import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import InlineBanner, { useInlineBanner } from './InlineBanner';

const NewsletterBox = () => {
    const [email, setEmail] = useState('');
    const { banner, showBanner, clearBanner } = useInlineBanner();

    const onSubmitHandler = () => {
        if (!email) {
            showBanner("Please enter an email address.", "warning");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showBanner("Please enter a valid email address.", "error");
            return;
        }
        showBanner("Thanks for subscribing! You'll get 20% off.", "success");
        setEmail('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Subscribe now & get 20% off</Text>
            <Text style={styles.subtitle}>
                Stay updated with our latest collections and exclusive offers.
            </Text>

            {/* Inline Banner */}
            <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={(t) => { setEmail(t); clearBanner(); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={onSubmitHandler}>
                    <Text style={styles.buttonText}>SUBSCRIBE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
    },
    subtitle: {
        color: '#9ca3af',
        marginTop: 8,
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#000',
    },
    button: {
        backgroundColor: '#000',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default NewsletterBox;

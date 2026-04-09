import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, RefreshCw, Headset } from 'lucide-react-native';

const OurPolicy = () => {
    return (
        <View style={styles.container}>
            <View style={styles.policyItem}>
                <RefreshCw color="#000" size={32} strokeWidth={1.5} />
                <Text style={styles.policyTitle}>7 Days Return Policy</Text>
                <Text style={styles.policyDescription}>We provide 7 days free return policy</Text>
            </View>

            <View style={styles.policyItem}>
                <ShieldCheck color="#000" size={32} strokeWidth={1.5} />
                <Text style={styles.policyTitle}>100% Original</Text>
                <Text style={styles.policyDescription}>All products are original and quality checked</Text>
            </View>

            <View style={styles.policyItem}>
                <Headset color="#000" size={32} strokeWidth={1.5} />
                <Text style={styles.policyTitle}>Best Customer Support</Text>
                <Text style={styles.policyDescription}>We provide 24/7 customer support</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 64,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    policyItem: {
        alignItems: 'center',
        flex: 1,
    },
    policyTitle: {
        fontWeight: 'bold',
        marginTop: 20,
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
    },
    policyDescription: {
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
});

export default OurPolicy;

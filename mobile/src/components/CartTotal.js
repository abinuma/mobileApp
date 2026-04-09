import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
    const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Title text1="CART" text2="TOTALS" />
            </View>
            
            <View style={styles.totalsBox}>
                <View style={styles.row}>
                    <Text style={styles.label}>Subtotal</Text>
                    <Text style={styles.value}>{currency}{getCartAmount()}.00</Text>
                </View>
                <View style={styles.hr} />
                <View style={styles.row}>
                    <Text style={styles.label}>Shipping Fee</Text>
                    <Text style={styles.value}>{currency}{delivery_fee}.00</Text>
                </View>
                <View style={styles.hr} />
                <View style={styles.row}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                        {currency}{getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee}.00
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 16,
    },
    totalsBox: {
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        color: '#4b5563',
    },
    value: {
        color: '#1f2937',
    },
    hr: {
        height: 1,
        backgroundColor: '#f3f4f6',
        width: '100%',
    },
    totalLabel: {
        fontWeight: 'bold',
        color: '#111827',
    },
    totalValue: {
        fontWeight: 'bold',
        color: '#111827',
    },
});

export default CartTotal;

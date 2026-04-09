import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);

    useEffect(() => {
        const bestProduct = products.filter((item) => (item.bestseller));
        setBestSeller(bestProduct.slice(0, 4));
    }, [products]);

    if (bestSeller.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title text1={"BEST"} text2={"SELLERS"} />
                <Text style={styles.subtitle}>
                    Explore our best sellers — the most popular products in our collection.
                </Text>
            </View>

            <View style={styles.grid}>
                {bestSeller.map((item, index) => (
                    <ProductItem 
                        key={index} 
                        id={item._id} 
                        name={item.name} 
                        image={item.image} 
                        price={item.price} 
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        paddingHorizontal: '5%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    subtitle: {
        color: '#666666',
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
        maxWidth: '80%',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});

export default BestSeller;

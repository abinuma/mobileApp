import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ShopContext } from '../context/ShopContext';
import { useNavigation } from '@react-navigation/native';

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('ProductDetail', { productId: id })}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: image[0] }} 
          style={styles.image}
          resizeMode="cover" 
        />
      </View>
      <View style={styles.infoWrapper}>
        <Text style={styles.nameText} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.priceText}>
          {currency}{price}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%', // Allows 2 items per row with space in between
    marginBottom: 24,
  },
  imageWrapper: {
    backgroundColor: '#f3f4f6', 
    // MERN stack web version is often borderless/minimal
    overflow: 'hidden',
    aspectRatio: 3/4, // classic clothing photography ratio
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoWrapper: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  nameText: {
    color: '#4b5563', // text-gray-600
    fontSize: 14,
    fontWeight: '400',
  },
  priceText: {
    color: '#111827', // text-gray-900
    fontWeight: '600',
    marginTop: 2,
    fontSize: 14,
  },
});

export default ProductItem;

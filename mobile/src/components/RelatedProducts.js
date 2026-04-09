import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({ category, subCategory, productId }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();
      productsCopy = productsCopy.filter((item) => category === item.category);
      productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);
      productsCopy = productsCopy.filter((item) => item._id !== productId);
      setRelated(productsCopy.slice(0, 4)); // Showing 4 related items for mobile grid
    }
  }, [products, productId, category, subCategory]);

  if (related.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </View>
      <View style={styles.grid}>
        {related.map((item, index) => (
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
    marginTop: 48,
    paddingHorizontal: 16,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default RelatedProducts;

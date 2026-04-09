import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import Title from '../components/Title';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';

const HomeScreen = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    if (products && products.length > 0) {
      setLatestProducts(products.slice(0, 10));
    }
  }, [products]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>LATEST ARRIVALS</Text>
          <Text style={styles.heroSubtitle}>Modern designs for everyday style</Text>
        </View>

        {/* Content Body */}
        <View style={styles.contentWrapper}>
          <View style={styles.titleWrapper}>
            <Title text1="LATEST" text2="COLLECTIONS" />
          </View>
          
          <View style={styles.grid}>
            {latestProducts.map((item, index) => (
              <ProductItem 
                key={index}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))}
          </View>

          {/* Best Sellers Section */}
          <BestSeller />

          {/* Policy Section */}
          <OurPolicy />

          {/* Newsletter Section */}
          <NewsletterBox />
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
    paddingBottom: 40, 
  },
  heroSection: {
    paddingHorizontal: '5%',
    paddingVertical: 48,
    backgroundColor: '#fafafa', // Minimalist off-white to match the sleek vibe
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 32,
    color: '#333333',
    fontFamily: 'sans-serif-light',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: '#666666',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  contentWrapper: {
    paddingHorizontal: '5%', // Simulates web 'sm:px-[5vw]'
    paddingTop: 32,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default HomeScreen;

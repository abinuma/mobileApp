import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator as RNActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import { Button, ActivityIndicator } from 'react-native-paper';
import RelatedProducts from '../components/RelatedProducts';
import InlineBanner, { useInlineBanner } from '../components/InlineBanner';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const { products, currency, addToCart, token } = useContext(ShopContext);
  const { banner, showBanner, clearBanner } = useInlineBanner();
  
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [adding, setAdding] = useState(false);
  const [sizeError, setSizeError] = useState(false); // Red border on sizes

  const fetchProductData = () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      if (product.image && product.image.length > 0) {
        setImage(product.image[0]);
      }
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const handleAddToCart = async () => {
    if (!token) {
      showBanner("Please login to place an order.", "warning");
      setTimeout(() => {
        navigation.navigate('Profile', { screen: 'ProfileMain' });
      }, 1500);
      return;
    }
    if (!size) {
      setSizeError(true);
      showBanner("Please select a size before adding to cart.", "warning");
      return;
    }
    setSizeError(false);
    clearBanner();
    setAdding(true);
    try {
        await addToCart(productData._id, size);
        showBanner(`${productData.name} (${size}) added to cart!`, "success");
    } catch (error) {
        console.log(error);
        showBanner("Failed to add item to cart. Please try again.", "error");
    } finally {
        setAdding(false);
    }
  };

  if (!productData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" animating={true} color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Image */}
        <View style={styles.mainImageContainer}>
          <Image 
            source={{ uri: image }} 
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Thumbnail Images */}
        <View style={styles.thumbnailContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {productData.image.map((img, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setImage(img)} 
                style={[
                  styles.thumbnailWrapper,
                  image === img && styles.thumbnailActive
                ]}
              >
                <Image 
                  source={{ uri: img }} 
                  style={[styles.thumbnail, image === img && { opacity: 0.5 }]} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{productData.name}</Text>
          <Text style={styles.price}>{currency}{productData.price}</Text>
          <Text style={styles.description}>{productData.description}</Text>

          {/* Inline Banner */}
          <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />

          {/* Size Selection */}
          <View style={[styles.sizeSection, sizeError && styles.sizeSectionError]}>
            <Text style={[styles.sizeTitle, sizeError && { color: '#dc2626' }]}>
              Select Size {sizeError ? '— required' : ''}
            </Text>
            <View style={styles.sizeGrid}>
              {productData.sizes && productData.sizes.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => { setSize(item); setSizeError(false); clearBanner(); }}
                  style={[
                    styles.sizeBox,
                    size === item && styles.sizeBoxActive,
                    sizeError && styles.sizeBoxError,
                  ]}
                >
                  <Text style={[
                    styles.sizeText,
                    size === item && styles.sizeTextActive,
                    sizeError && styles.sizeTextError,
                  ]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add to Cart Button */}
          <Button 
            mode="contained" 
            onPress={handleAddToCart}
            disabled={adding}
            style={styles.addToCartBtn}
            contentStyle={styles.addToCartBtnContent}
            labelStyle={styles.addToCartBtnLabel}
          >
            {adding ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <RNActivityIndicator size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Adding to Cart...</Text>
              </View>
            ) : "ADD TO CART"}
          </Button>
          
          <View style={styles.policyContainer}>
            <Text style={styles.policyText}>100% Original product.</Text>
            <Text style={styles.policyText}>Cash on delivery is available on this product.</Text>
            <Text style={styles.policyText}>Easy return and exchange policy within 7 days.</Text>
          </View>

          <RelatedProducts 
            category={productData.category} 
            subCategory={productData.subCategory} 
            productId={productData._id} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainImageContainer: {
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 384,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  thumbnailWrapper: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  thumbnailActive: {
    borderColor: '#f97316',
  },
  thumbnail: {
    width: 64,
    height: 80,
  },
  infoContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  description: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 24,
  },
  sizeSection: {
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sizeSectionError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  sizeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginRight: 8,
    marginBottom: 8,
  },
  sizeBoxActive: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  sizeBoxError: {
    borderColor: '#fca5a5',
  },
  sizeText: {
    color: '#374151',
  },
  sizeTextActive: {
    color: '#f97316',
    fontWeight: 'bold',
  },
  sizeTextError: {
    color: '#dc2626',
  },
  addToCartBtn: {
    borderRadius: 4,
    backgroundColor: '#000',
    marginBottom: 32,
  },
  addToCartBtnContent: {
    paddingVertical: 8,
  },
  addToCartBtnLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  policyContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 24,
  },
  policyText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});

export default ProductDetailScreen;

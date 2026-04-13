import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import InlineBanner, { useInlineBanner } from '../components/InlineBanner';
import Title from '../components/Title';
import { Trash2 } from 'lucide-react-native';
import { Button } from 'react-native-paper';

const CartScreen = ({ navigation }) => {
  const { products, currency, cartItems, updateQuantity, getCartAmount, delivery_fee } = useContext(ShopContext);
  const { banner, showBanner, clearBanner } = useInlineBanner();
  const [cartData, setCartData] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  const handleCheckout = () => {
    if (getCartAmount() === 0) {
        showBanner("Your cart is empty. Add some items first!", "warning");
        return;
    }
    navigation.navigate('PlaceOrder');
  };

  const cartAmount = getCartAmount();
  const totalAmount = cartAmount === 0 ? 0 : cartAmount + delivery_fee;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Title text1="YOUR" text2="CART" />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Inline Banner */}
        {banner.message ? (
          <View style={{ marginTop: 12 }}>
            <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />
          </View>
        ) : null}

        {cartData.length > 0 ? (
          cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);
            if (!productData) return null;

            return (
              <View key={index} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Image 
                    source={{ uri: productData.image[0] }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {productData.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>{currency}{productData.price}</Text>
                      <View style={styles.sizeBox}>
                        <Text style={styles.sizeText}>{item.size}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsBox}>
                  <RNTextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={item.quantity.toString()}
                    onChangeText={(val) => {
                      const num = parseInt(val);
                      if (!isNaN(num) && num >= 0) {
                         updateQuantity(item._id, item.size, num);
                      }
                    }}
                    onEndEditing={(e) => {
                      if (e.nativeEvent.text === '') {
                         updateQuantity(item._id, item.size, 1);
                      }
                    }}
                  />
                  <TouchableOpacity onPress={() => updateQuantity(item._id, item.size, 0)}>
                    <Trash2 color="#ef4444" size={24} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        )}

        {cartData.length > 0 && (
          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <Title text1="CART" text2="TOTALS" />
              <View style={styles.totalsRows}>
                <View style={styles.totalRow}>
                  <Text style={styles.rowLabel}>Subtotal</Text>
                  <Text style={styles.rowValue}>{currency}{cartAmount}.00</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.rowLabel}>Shipping Fee</Text>
                  <Text style={styles.rowValue}>{currency}{delivery_fee}.00</Text>
                </View>
                <View style={[styles.totalRow, styles.lastRow]}>
                  <Text style={styles.grandTotalLabel}>Total</Text>
                  <Text style={styles.grandTotalValue}>{currency}{totalAmount}.00</Text>
                </View>
              </View>

              <Button 
                mode="contained" 
                style={styles.checkoutBtn}
                contentStyle={styles.checkoutBtnContent}
                onPress={handleCheckout}
                loading={checkingOut}
                disabled={checkingOut}
              >
                {checkingOut ? "CHECKING OUT..." : "PROCEED TO CHECKOUT"}
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cartItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 64,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  itemDetails: {
    marginLeft: 16,
    flex: 1,
  },
  itemName: {
    color: '#1f2937',
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sizeBox: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 16,
    borderRadius: 4,
  },
  sizeText: {
    fontSize: 12,
    color: '#4b5563',
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    width: 48,
    textAlign: 'center',
    borderRadius: 4,
    paddingVertical: 4,
    marginRight: 16,
    backgroundColor: '#ffffff',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 18,
  },
  totalsContainer: {
    marginTop: 32,
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: '100%',
  },
  totalsRows: {
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastRow: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  rowLabel: {
    color: '#4b5563',
  },
  rowValue: {
    fontWeight: '500',
    color: '#1f2937',
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 16,
  },
  grandTotalValue: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 16,
  },
  checkoutBtn: {
    backgroundColor: '#000000',
    borderRadius: 4,
    marginTop: 24,
  },
  checkoutBtnContent: {
    paddingVertical: 8,
  },
});

export default CartScreen;

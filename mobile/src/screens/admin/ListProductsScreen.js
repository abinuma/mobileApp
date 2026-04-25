import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { ShopContext } from '../../context/ShopContext';
import InlineBanner, { useInlineBanner } from '../../components/InlineBanner';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trash2, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const ListProductsScreen = () => {
  const { backendUrl, currency } = useContext(ShopContext);
  const navigation = useNavigation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { banner, showBanner, clearBanner } = useInlineBanner();

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        showBanner(response.data.message || "Failed to load products.", "error");
      }
    } catch (error) {
      const msg = error.message;
      if (msg.includes('Network Error')) {
        showBanner("Unable to connect. Check your internet connection.", "error");
      } else {
        showBanner(msg || "Failed to load products.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    setDeletingId(id);
    try {
      const adminToken = await AsyncStorage.getItem('adminToken');
      const response = await axios.delete(backendUrl + `/api/product/${id}`, {
        headers: { token: adminToken }
      });

      if (response.data.success) {
        showBanner("Product deleted successfully.", "success");
        await fetchList();
      } else {
        showBanner(response.data.message || "Failed to delete product.", "error");
      }
    } catch (error) {
      showBanner(error.message || "Failed to delete product.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (id) => {
    // Keep Alert.alert for confirmation dialogs — this is appropriate UX
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeProduct(id) }
      ]
    );
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>All Products List</Text>
        <TouchableOpacity 
          style={styles.backToShop} 
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        >
          <ArrowLeft size={14} color="#6b7280" />
          <Text style={styles.backToShopText}>Back to Shop</Text>
        </TouchableOpacity>
      </View>

      {/* Inline Banner */}
      <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />
      
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {list.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Image source={{ uri: item.image[0] }} style={styles.itemImage} />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemCat}>{item.category}</Text>
                <Text style={styles.itemPrice}>{currency}{item.price}</Text>
              </View>
              
              <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteBtn} disabled={deletingId === item._id}>
                {deletingId === item._id ? (
                  <ActivityIndicator size={20} color="#ef4444" />
                ) : (
                  <Trash2 color="#ef4444" size={20} />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  backToShop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  backToShopText: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#f9fafb',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  itemCat: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
});

export default ListProductsScreen;

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { ShopContext } from '../../context/ShopContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trash2 } from 'lucide-react-native';

const ListProductsScreen = () => {
  const { backendUrl, currency, products, setToken } = useContext(ShopContext); // Reusing list from context or refetch
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      console.log(`[API Call] Fetching product list: ${backendUrl}/api/product/list`);
      const response = await axios.get(backendUrl + "/api/product/list");
      console.log('[API Success] Fetch list response:', response.data.success);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error('[API Error] Fetch list failed:', error.response?.data || error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      const adminToken = await AsyncStorage.getItem('adminToken');
      console.log(`[API Call] Removing product: ${backendUrl}/api/product/${id}`);
      const response = await axios.delete(backendUrl + `/api/product/${id}`, {
        headers: { token: adminToken }
      });
      console.log('[API Success] Remove product response:', response.data.success);

      if (response.data.success) {
        Alert.alert("Success", response.data.message);
        await fetchList();
      } else {
        Alert.alert("Error", response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('[API Error] Remove product failed:', error.response?.data || error.message);
      Alert.alert("Error", error.message);
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
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
      <Text style={styles.title}>All Products List</Text>
      
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
              
              <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteBtn}>
                <Trash2 color="#ef4444" size={20} />
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
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

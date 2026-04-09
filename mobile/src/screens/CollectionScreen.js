import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { ChevronRight, ChevronDown } from 'lucide-react-native';

const CollectionScreen = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);

  const [sortType, setSortType] = useState('relevant');

  const toggleCategory = (val) => {
    if (category.includes(val)) {
      setCategory((prev) => prev.filter((item) => item !== val));
    } else {
      setCategory((prev) => [...prev, val]);
    }
  };

  const toggleSubCategory = (val) => {
    if (subCategory.includes(val)) {
      setSubCategory((prev) => prev.filter((item) => item !== val));
    } else {
      setSubCategory((prev) => [...prev, val]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    // Text + Price search
    if (showSearch && search) {
      productsCopy = productsCopy.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.price.toString().includes(search)
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    // Apply Sorting
    switch (sortType) {
      case 'low-high':
        productsCopy.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        productsCopy.sort((a, b) => b.price - a.price);
        break;
      default:
        // No additional sort needed for 'relevant' (default order)
        break;
    }

    setFilterProducts(productsCopy);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products, sortType]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Filters sidebar */}
        {showFilter && (
          <View style={styles.sidebar}>
            <ScrollView contentContainerStyle={styles.sidebarContent}>
              <Text style={styles.filterTitle}>CATEGORIES</Text>
              {['Men', 'Women', 'Kids'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.filterRow}
                  onPress={() => toggleCategory(cat)}
                >
                  <View style={[styles.checkbox, category.includes(cat) && styles.checkboxActive]} />
                  <Text style={styles.filterLabel}>{cat}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.filterTitle, { marginTop: 24 }]}>TYPE</Text>
              {['Topwear', 'Bottomwear', 'Winterwear'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.filterRow}
                  onPress={() => toggleSubCategory(type)}
                >
                  <View style={[styles.checkbox, subCategory.includes(type) && styles.checkboxActive]} />
                  <Text style={styles.filterLabel}>{type}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.filterTitle, { marginTop: 24 }]}>SORT BY</Text>
              {[
                { label: 'Relevant', value: 'relevant' },
                { label: 'Price: Low-High', value: 'low-high' },
                { label: 'Price: High-Low', value: 'high-low' }
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.value}
                  style={styles.filterRow}
                  onPress={() => setSortType(sort.value)}
                >
                  <View style={[styles.radio, sortType === sort.value && styles.radioActive]} />
                  <Text style={styles.filterLabel}>{sort.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Title text1="ALL" text2="COLLECTIONS" />
            <TouchableOpacity 
              style={styles.filterToggle} 
              onPress={() => setShowFilter(!showFilter)}
            >
              <Text style={styles.filterToggleText}>FILTERS & SORT</Text>
              {showFilter ? <ChevronRight size={16} color="#000" /> : <ChevronDown size={16} color="#000" />}
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.productsScroll} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.grid}>
              {filterProducts.length > 0 ? (
                filterProducts.map((item, index) => (
                  <ProductItem
                    key={index}
                    id={item._id}
                    image={item.image}
                    name={item.name}
                    price={item.price}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No products found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: '40%',
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  sidebarContent: {
    padding: 16,
    paddingTop: 24,
  },
  filterTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#9ca3af',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9ca3af',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterLabel: {
    color: '#4b5563',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  filterToggleText: {
    fontSize: 12,
    marginRight: 4,
    fontWeight: 'bold',
    color: '#000',
  },
  productsScroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  emptyState: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 18,
  },
});

export default CollectionScreen;

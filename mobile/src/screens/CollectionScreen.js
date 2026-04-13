import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Check } from 'lucide-react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = ['Men', 'Women', 'Kids'];
const TYPES = ['Topwear', 'Bottomwear', 'Winterwear'];
const SORT_OPTIONS = [
  { label: 'Relevant', value: 'relevant' },
  { label: 'Price: Low → High', value: 'low-high' },
  { label: 'Price: High → Low', value: 'high-low' },
];

// --- Chip Component ---
const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {active && <Check size={13} color="#fff" style={{ marginRight: 4 }} />}
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// --- Sort Pill ---
const SortPill = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.sortPill, active && styles.sortPillActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.sortPillText, active && styles.sortPillTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const CollectionScreen = () => {
  const { products, search, showSearch, getProductsData } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [refreshing, setRefreshing] = useState(false);

  const activeFilterCount = category.length + subCategory.length + (sortType !== 'relevant' ? 1 : 0);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const toggleCategory = (val) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (category.includes(val)) {
      setCategory((prev) => prev.filter((item) => item !== val));
    } else {
      setCategory((prev) => [...prev, val]);
    }
  };

  const toggleSubCategory = (val) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (subCategory.includes(val)) {
      setSubCategory((prev) => prev.filter((item) => item !== val));
    } else {
      setSubCategory((prev) => [...prev, val]);
    }
  };

  const clearAllFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategory([]);
    setSubCategory([]);
    setSortType('relevant');
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

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

    switch (sortType) {
      case 'low-high':
        productsCopy.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        productsCopy.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilterProducts(productsCopy);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products, sortType]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getProductsData();
    } catch (e) {
      // error handled inside getProductsData
    }
    setRefreshing(false);
  }, [getProductsData]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Title text1="ALL" text2="COLLECTIONS" />
        <TouchableOpacity style={[styles.filterToggle, showFilter && styles.filterToggleActive]} onPress={toggleFilter} activeOpacity={0.7}>
          <SlidersHorizontal size={16} color={showFilter ? '#fff' : '#374151'} />
          <Text style={[styles.filterToggleText, showFilter && styles.filterToggleTextActive]}>
            Filters
          </Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
          {showFilter
            ? <ChevronUp size={16} color="#fff" />
            : <ChevronDown size={16} color="#374151" />
          }
        </TouchableOpacity>
      </View>

      {/* Collapsible Filter Panel */}
      {showFilter && (
        <View style={styles.filterPanel}>
          {/* Category Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>CATEGORY</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={category.includes(cat)}
                  onPress={() => toggleCategory(cat)}
                />
              ))}
            </View>
          </View>

          {/* Type Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>TYPE</Text>
            <View style={styles.chipsRow}>
              {TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  active={subCategory.includes(type)}
                  onPress={() => toggleSubCategory(type)}
                />
              ))}
            </View>
          </View>

          {/* Sort Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>SORT BY</Text>
            <View style={styles.chipsRow}>
              {SORT_OPTIONS.map((sort) => (
                <SortPill
                  key={sort.value}
                  label={sort.label}
                  active={sortType === sort.value}
                  onPress={() => setSortType(sort.value)}
                />
              ))}
            </View>
          </View>

          {/* Clear All */}
          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllFilters} activeOpacity={0.7}>
              <X size={14} color="#ef4444" />
              <Text style={styles.clearAllText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Active Filter Summary (shown when panel is collapsed) */}
      {!showFilter && activeFilterCount > 0 && (
        <View style={styles.activeSummary}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeSummaryScroll}>
            {category.map((cat) => (
              <TouchableOpacity key={cat} style={styles.activeTag} onPress={() => toggleCategory(cat)}>
                <Text style={styles.activeTagText}>{cat}</Text>
                <X size={12} color="#6b7280" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
            {subCategory.map((type) => (
              <TouchableOpacity key={type} style={styles.activeTag} onPress={() => toggleSubCategory(type)}>
                <Text style={styles.activeTagText}>{type}</Text>
                <X size={12} color="#6b7280" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
            {sortType !== 'relevant' && (
              <TouchableOpacity style={styles.activeTag} onPress={() => setSortType('relevant')}>
                <Text style={styles.activeTagText}>{SORT_OPTIONS.find(s => s.value === sortType)?.label}</Text>
                <X size={12} color="#6b7280" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.clearAllMini} onPress={clearAllFilters}>
              <Text style={styles.clearAllMiniText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Result count */}
      <View style={styles.resultBar}>
        <Text style={styles.resultCount}>
          {filterProducts.length} {filterProducts.length === 1 ? 'product' : 'products'} found
        </Text>
      </View>

      {/* Products Grid */}
      <ScrollView
        style={styles.productsScroll}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
            colors={['#000']}
          />
        }
      >
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
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyStateTitle}>No products found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your filters or search terms</Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.emptyResetBtn} onPress={clearAllFilters}>
                  <Text style={styles.emptyResetText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  // --- Header ---
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    gap: 6,
  },
  filterToggleActive: {
    backgroundColor: '#111827',
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  filterToggleTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // --- Filter Panel ---
  filterPanel: {
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // --- Chips ---
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  // --- Sort Pills ---
  sortPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  sortPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  sortPillText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  sortPillTextActive: {
    color: '#ffffff',
  },
  // --- Clear All ---
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearAllText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 4,
  },
  // --- Active Summary (collapsed state) ---
  activeSummary: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 8,
    paddingLeft: 16,
  },
  activeSummaryScroll: {
    alignItems: 'center',
    gap: 6,
    paddingRight: 16,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  activeTagText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  clearAllMini: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  clearAllMiniText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  // --- Result Bar ---
  resultBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultCount: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  // --- Products ---
  productsScroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  // --- Empty State ---
  emptyState: {
    width: '100%',
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyStateTitle: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyResetBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#111827',
  },
  emptyResetText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CollectionScreen;

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../context/ShopContext';
import InlineBanner, { useInlineBanner } from '../components/InlineBanner';
import Title from '../components/Title';
import axios from 'axios';

const OrdersScreen = () => {
    const { backendUrl, token, currency } = useContext(ShopContext);
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trackingId, setTrackingId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { banner, showBanner, clearBanner } = useInlineBanner();

    const loadOrderData = async (showLoading = true) => {
        if (!token) return;
        
        if (showLoading) setLoading(true);
        try {
            const response = await axios.get(backendUrl + '/api/order/userorders', { 
                headers: { token } 
            });
            
            if (response.data.success) {
                let allOrders = [];
                response.data.orders.forEach((order) => {
                    order.items.forEach((item) => {
                        item['status'] = order.status;
                        item['payment'] = order.payment;
                        item['paymentMethod'] = order.paymentMethod;
                        item['date'] = order.date;
                        allOrders.push(item);
                    });
                });
                setOrderData(allOrders.reverse());
            } else {
                showBanner(response.data.message || "Failed to load orders.", "error");
            }
        } catch (error) {
            console.log(error);
            const msg = error.message;
            if (msg.includes('Network Error')) {
                showBanner("Unable to connect. Check your internet connection.", "error");
            } else {
                showBanner(msg || "Failed to load orders.", "error");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadOrderData(false);
    }, [token]);

    useEffect(() => {
        loadOrderData();
    }, [token]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Title text1="MY" text2="ORDERS" />
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.loadingText}>Fetching your orders...</Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.container}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Inline Banner */}
                    {banner.message ? (
                        <View style={{ marginTop: 8 }}>
                            <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />
                        </View>
                    ) : null}

                    {orderData.length > 0 ? (
                        orderData.map((item, index) => (
                            <View key={index} style={styles.orderCard}>
                                <View style={styles.itemRow}>
                                    <Image source={{ uri: item.image[0] }} style={styles.itemImage} resizeMode="cover" />
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                        <View style={styles.detailsRow}>
                                            <Text style={styles.itemPrice}>{currency}{item.price}</Text>
                                            <View style={styles.verticalDivider} />
                                            <Text style={styles.mutedText}>Qty: {item.quantity}</Text>
                                            <View style={styles.verticalDivider} />
                                            <Text style={styles.mutedText}>Size: {item.size}</Text>
                                        </View>
                                        <View style={styles.infoMetaContainer}>
                                            <Text style={styles.dateLabel}>Date: <Text style={styles.metaValue}>{new Date(item.date).toDateString()}</Text></Text>
                                            <Text style={styles.paymentLabel}>Payment: <Text style={styles.metaValue}>{item.paymentMethod}</Text></Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.footerRow}>
                                    <View style={styles.statusContainer}>
                                        <View style={[styles.statusDot, { backgroundColor: item.status === 'Delivered' ? '#10b981' : (item.status === 'Out for delivery' ? '#3b82f6' : '#f59e0b') }]} />
                                        <Text style={styles.statusText}>{item.status}</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.trackBtn} 
                                        onPress={async () => {
                                            setTrackingId(index);
                                            await loadOrderData(false);
                                            setTrackingId(null);
                                        }}
                                        disabled={trackingId === index}
                                    >
                                        {trackingId === index ? (
                                            <ActivityIndicator size={14} color="#374151" />
                                        ) : (
                                            <Text style={styles.trackBtnText}>Track Order</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6b7280',
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    orderCard: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    itemRow: {
        flexDirection: 'row',
    },
    itemImage: {
        width: 80,
        height: 100,
        borderRadius: 4,
        backgroundColor: '#f9fafb',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 16,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    verticalDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#d1d5db',
    },
    mutedText: {
        fontSize: 14,
        color: '#6b7280',
    },
    infoMetaContainer: {
        marginTop: 10,
        backgroundColor: '#f9fafb',
        padding: 8,
        borderRadius: 4,
    },
    dateLabel: {
        fontSize: 12,
        color: '#4b5563',
        marginBottom: 2,
    },
    paymentLabel: {
        fontSize: 12,
        color: '#4b5563',
    },
    metaValue: {
        color: '#1f2937',
        fontWeight: '500',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    trackBtn: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    trackBtnText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
    },
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
    },
});

export default OrdersScreen;

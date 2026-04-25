import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopContext } from '../../context/ShopContext';
import InlineBanner, { useInlineBanner } from '../../components/InlineBanner';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

const AdminOrdersScreen = () => {
    const { backendUrl, currency } = React.useContext(ShopContext);
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const { banner, showBanner, clearBanner } = useInlineBanner();

    const fetchAllOrders = async () => {
        const token = await AsyncStorage.getItem('adminToken');
        if (!token) return;

        setLoading(true);
        try {
            const response = await axios.get(backendUrl + "/api/order/list", {
                headers: { token }
            });
            if (response.data.success) {
                setOrders(response.data.orders.reverse());
            } else {
                showBanner(response.data.message || "Failed to load orders.", "error");
            }
        } catch (error) {
            const msg = error.message;
            if (msg.includes('Network Error')) {
                showBanner("Unable to connect. Check your internet connection.", "error");
            } else {
                showBanner(msg || "Failed to load orders.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const statusHandler = async (orderId, newStatus) => {
        const token = await AsyncStorage.getItem('adminToken');
        setUpdatingOrderId(orderId);
        try {
            const response = await axios.patch(
                backendUrl + "/api/order/status",
                { orderId, status: newStatus },
                { headers: { token } }
            );
            if (response.data.success) {
                showBanner(`Order status updated to "${newStatus}".`, "success");
                await fetchAllOrders();
            } else {
                showBanner(response.data.message || "Failed to update status.", "error");
            }
        } catch (error) {
            showBanner(error.message || "Failed to update order status.", "error");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Orders</Text>
                <TouchableOpacity 
                    style={styles.backToShop} 
                    onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
                >
                    <ArrowLeft size={14} color="#6b7280" />
                    <Text style={styles.backToShopText}>Back to Shop</Text>
                </TouchableOpacity>
            </View>

            {/* Inline Banner */}
            {banner.message ? (
                <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                    <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />
                </View>
            ) : null}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            ) : (
                <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                    {orders.length > 0 ? (
                        orders.map((order, index) => (
                            <View key={index} style={styles.orderCard}>
                                <View style={styles.orderHeader}>
                                    <View style={styles.parcelBox}>
                                        <Text style={styles.parcelEmoji}>📦</Text>
                                    </View>
                                    <View style={styles.itemsList}>
                                        {order.items.map((item, idx) => (
                                            <Text key={idx} style={styles.itemText}>
                                                {item.name} x {item.quantity} ({item.size})
                                                {idx !== order.items.length - 1 ? ',' : ''}
                                            </Text>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailSection}>
                                        <Text style={styles.customerName}>{order.address.firstName} {order.address.lastName}</Text>
                                        <Text style={styles.addressText}>{order.address.street}</Text>
                                        <Text style={styles.addressText}>{order.address.city}, {order.address.state}, {order.address.country} - {order.address.zipcode}</Text>
                                        <Text style={styles.phoneText}>{order.address.phone}</Text>
                                    </View>

                                    <View style={styles.infoSection}>
                                        <Text style={styles.infoText}>Items: {order.items.length}</Text>
                                        <Text style={styles.infoText}>Method: {order.paymentMethod}</Text>
                                        <Text style={styles.infoText}>Payment: {order.payment ? "Done" : "Pending"}</Text>
                                        <Text style={styles.infoText}>Date: {new Date(order.date).toLocaleDateString()}</Text>
                                    </View>
                                </View>

                                <View style={styles.amountRow}>
                                    <Text style={styles.amountText}>{currency}{order.amount}</Text>
                                    
                                    <View style={styles.statusPickerContainer}>
                                        <Text style={styles.statusLabel}>Update Status:</Text>
                                        {updatingOrderId === order._id ? (
                                            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                                                <ActivityIndicator size="small" color="#000" />
                                                <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Updating...</Text>
                                            </View>
                                        ) : (
                                        <View style={styles.statusButtons}>
                                            {['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'].map((status) => (
                                                <TouchableOpacity 
                                                    key={status}
                                                    onPress={() => statusHandler(order._id, status)}
                                                    style={[
                                                        styles.statusBtn, 
                                                        order.status === status && styles.statusBtnActive
                                                     ]}
                                                    disabled={updatingOrderId !== null}
                                                >
                                                    <Text style={[styles.statusBtnText, order.status === status && styles.statusBtnTextActive]}>
                                                        {status === 'Order Placed' ? 'Placed' : status}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No orders found</Text>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
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
        marginVertical: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 16,
        borderRadius: 8,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    parcelBox: {
        width: 40,
        height: 40,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    parcelEmoji: {
        fontSize: 24,
    },
    itemsList: {
        flex: 1,
        marginLeft: 12,
    },
    itemText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 12,
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailSection: {
        flex: 1,
    },
    infoSection: {
        flex: 0.8,
        alignItems: 'flex-end',
    },
    customerName: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#111827',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        color: '#6b7280',
    },
    phoneText: {
        fontSize: 13,
        color: '#374151',
        marginTop: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#4b5563',
        marginBottom: 2,
    },
    amountRow: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    statusPickerContainer: {
        marginTop: 8,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    statusBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#f9fafb',
    },
    statusBtnActive: {
        borderColor: '#000',
        backgroundColor: '#f3f4f6',
    },
    statusBtnText: {
        fontSize: 11,
        color: '#4b5563',
    },
    statusBtnTextActive: {
        color: '#000',
        fontWeight: 'bold',
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

export default AdminOrdersScreen;

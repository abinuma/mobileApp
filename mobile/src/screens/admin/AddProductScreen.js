import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator as RNActivityIndicator } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { ShopContext } from '../../context/ShopContext';
import InlineBanner, { useInlineBanner } from '../../components/InlineBanner';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

// Move ImageBox outside to prevent re-mounts on every state change
const ImageBox = ({ image, onPress, hasError }) => (
    <TouchableOpacity style={[styles.imageBox, hasError && styles.imageBoxError]} onPress={onPress}>
        {image ? (
            <Image 
                source={{ uri: image.uri }} 
                style={styles.previewImage} 
                key={image.uri} // Ensure refresh on URI change
            />
        ) : (
            <View style={[styles.placeholderBox, hasError && styles.placeholderBoxError]}>
                <Text style={[styles.placeholderText, hasError && { color: '#ef4444' }]}>+</Text>
            </View>
        )}
    </TouchableOpacity>
);

const AddProductScreen = () => {
    const { backendUrl } = useContext(ShopContext);
    const navigation = useNavigation();
    const { banner, showBanner, clearBanner } = useInlineBanner();
    
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [image3, setImage3] = useState(null);
    const [image4, setImage4] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Men");
    const [subCategory, setSubCategory] = useState("Topwear");
    const [sizes, setSizes] = useState([]);
    const [bestseller, setBestseller] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});


    const clearFieldError = (field) => {
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    const pickImage = async (setter, fieldName) => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [3, 4],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setter(result.assets[0]);
                clearFieldError(fieldName);
                clearBanner();
            }
        } catch (e) {
            // image picker error
        }
    };

    const toggleSize = (size) => {
        setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size]);
        clearFieldError('sizes');
        clearBanner();
    };

    const getFileForFormData = async (imageAsset, fieldName) => {
        if (!imageAsset) return null;

        try {
            if (Platform.OS === 'web') {
                const response = await fetch(imageAsset.uri);
                const blob = await response.blob();
                
                // Get extension from mime type
                let extension = 'jpg';
                if (blob.type === 'image/png') extension = 'png';
                if (blob.type === 'image/gif') extension = 'gif';
                if (blob.type === 'image/webp') extension = 'webp';
                
                return new File([blob], `${fieldName}.${extension}`, { type: blob.type });
            } else {
                const uriParts = imageAsset.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                return {
                    uri: imageAsset.uri,
                    name: `${fieldName}.${fileType}`,
                    type: `image/${fileType}`,
                };
            }
        } catch (e) {
            return null;
        }
    };

    const onSubmitHandler = async () => {
        clearBanner();

        // Validate and highlight missing fields
        const errors = {};
        const missing = [];

        if (!name) { errors.name = true; missing.push("Name"); }
        if (!description) { errors.description = true; missing.push("Description"); }
        if (!price) { errors.price = true; missing.push("Price"); }
        if (!image1) { errors.image1 = true; missing.push("First Image"); }
        if (sizes.length === 0) { errors.sizes = true; missing.push("At least one Size"); }

        if (missing.length > 0) {
            setFieldErrors(errors);
            showBanner(`Please provide: ${missing.join(", ")}.`, "error");
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            const adminToken = await AsyncStorage.getItem('adminToken');
            
            if (!adminToken) {
                showBanner("Admin session expired. Please log in again.", "warning");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("subCategory", subCategory);
            formData.append("bestseller", bestseller ? "true" : "false"); 
            formData.append("sizes", JSON.stringify(sizes));

            // Process and append images
            const img1 = await getFileForFormData(image1, "image1");
            if (img1) formData.append("image1", img1);
            
            const img2 = await getFileForFormData(image2, "image2");
            if (img2) formData.append("image2", img2);

            const img3 = await getFileForFormData(image3, "image3");
            if (img3) formData.append("image3", img3);

            const img4 = await getFileForFormData(image4, "image4");
            if (img4) formData.append("image4", img4);

            const axiosConfig = {
                headers: { 
                    token: adminToken 
                }
            };
            
            // Standard multipart/form-data for mobile usually needs specific headers
            if (Platform.OS !== 'web') {
                axiosConfig.headers['Content-Type'] = 'multipart/form-data';
            }
            
            const response = await axios.post(backendUrl + "/api/product/add", formData, axiosConfig);
            
            if (response.data.success) {
                showBanner("Product added successfully!", "success");
                setName("");
                setDescription("");
                setImage1(null);
                setImage2(null);
                setImage3(null);
                setImage4(null);
                setPrice("");
                setSizes([]);
                setBestseller(false);
            } else {
                showBanner(response.data.message || "Failed to add product.", "error");
            }

        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            if (msg.includes('Network Error')) {
                showBanner("Unable to connect to server. Check your internet.", "error");
            } else {
                showBanner(msg || "Something went wrong. Please try again.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Back to Shop Button */}
            <TouchableOpacity 
                style={styles.backToShop} 
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
            >
                <ArrowLeft size={16} color="#6b7280" />
                <Text style={styles.backToShopText}>Back to Shop</Text>
            </TouchableOpacity>

            {/* Inline Banner */}
            <InlineBanner message={banner.message} type={banner.type} onDismiss={clearBanner} />

            <Text style={styles.label}>Upload Image (Box 1 Mandatory)</Text>
            <View style={styles.imagesRow}>
                <ImageBox image={image1} onPress={() => pickImage(setImage1, "image1")} hasError={fieldErrors.image1} />
                <ImageBox image={image2} onPress={() => pickImage(setImage2, "image2")} />
                <ImageBox image={image3} onPress={() => pickImage(setImage3, "image3")} />
                <ImageBox image={image4} onPress={() => pickImage(setImage4, "image4")} />
            </View>

            <TextInput
                mode="outlined"
                label="Product name"
                value={name}
                onChangeText={(t) => { setName(t); clearFieldError('name'); clearBanner(); }}
                style={styles.input}
                outlineColor={fieldErrors.name ? '#ef4444' : undefined}
                activeOutlineColor={fieldErrors.name ? '#ef4444' : '#000'}
                error={fieldErrors.name}
            />

            <TextInput
                mode="outlined"
                label="Product description"
                value={description}
                onChangeText={(t) => { setDescription(t); clearFieldError('description'); clearBanner(); }}
                multiline
                numberOfLines={4}
                style={styles.input}
                outlineColor={fieldErrors.description ? '#ef4444' : undefined}
                activeOutlineColor={fieldErrors.description ? '#ef4444' : '#000'}
                error={fieldErrors.description}
            />

            <View style={styles.row}>
                <View style={styles.halfWidth}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerContainer}>
                        {['Men', 'Women', 'Kids'].map(cat => (
                            <TouchableOpacity 
                                key={cat} 
                                style={[styles.selectBox, category === cat && styles.activeSelectBox]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={category === cat ? styles.activeSelectText : styles.selectText}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                
                <View style={styles.halfWidth}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.pickerContainer}>
                        {['Topwear', 'Bottomwear', 'Winterwear'].map(cat => (
                            <TouchableOpacity 
                                key={cat} 
                                style={[styles.selectBox, subCategory === cat && styles.activeSelectBox]}
                                onPress={() => setSubCategory(cat)}
                            >
                                <Text style={subCategory === cat ? styles.activeSelectText : styles.selectText}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <TextInput
                mode="outlined"
                label="Price"
                value={price}
                onChangeText={(t) => { setPrice(t); clearFieldError('price'); clearBanner(); }}
                keyboardType="numeric"
                style={styles.input}
                outlineColor={fieldErrors.price ? '#ef4444' : undefined}
                activeOutlineColor={fieldErrors.price ? '#ef4444' : '#000'}
                error={fieldErrors.price}
            />

            <Text style={[styles.label, fieldErrors.sizes && { color: '#ef4444' }]}>
                Product Sizes {fieldErrors.sizes ? '— select at least one' : ''}
            </Text>
            <View style={[styles.sizesRow, fieldErrors.sizes && styles.sizesRowError]}>
                {["S", "M", "L", "XL", "XXL"].map((sizeObj) => (
                    <TouchableOpacity 
                        key={sizeObj} 
                        style={[styles.sizeBox, sizes.includes(sizeObj) && styles.sizeBoxActive, fieldErrors.sizes && styles.sizeBoxError]}
                        onPress={() => toggleSize(sizeObj)}
                    >
                        <Text style={[styles.sizeText, sizes.includes(sizeObj) && styles.sizeTextActive, fieldErrors.sizes && !sizes.includes(sizeObj) && { color: '#ef4444' }]}>{sizeObj}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.checkboxContainer}>
                <Checkbox
                    status={bestseller ? 'checked' : 'unchecked'}
                    onPress={() => setBestseller(!bestseller)}
                    color="#000"
                />
                <Text style={styles.checkboxLabel}>Add to Bestseller</Text>
            </View>

            <Button 
                mode="contained" 
                onPress={onSubmitHandler} 
                disabled={loading}
                style={styles.submitBtn}
                contentStyle={{ paddingVertical: 8 }}
            >
                {loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <RNActivityIndicator size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Adding Product...</Text>
                    </View>
                ) : "ADD PRODUCT"}
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    backToShop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    backToShopText: {
        color: '#6b7280',
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '500',
    },
    label: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 8,
        marginTop: 16,
        fontWeight: '500',
    },
    imagesRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },
    imageBox: {
        width: 70,
        height: 70,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        borderRadius: 4,
        overflow: 'hidden',
    },
    imageBoxError: {
        borderColor: '#ef4444',
        borderWidth: 2,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholderBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    placeholderBoxError: {
        backgroundColor: '#fef2f2',
    },
    placeholderText: {
        fontSize: 24,
        color: '#9ca3af',
    },
    input: {
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    halfWidth: {
        width: '48%',
    },
    pickerContainer: {
        gap: 4,
    },
    selectBox: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        backgroundColor: '#fff',
        marginBottom: 4,
    },
    activeSelectBox: {
        borderColor: '#000',
        backgroundColor: '#f3f4f6',
    },
    selectText: {
        color: '#4b5563',
        textAlign: 'center',
    },
    activeSelectText: {
        color: '#000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    sizesRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    sizesRowError: {
        borderColor: '#fca5a5',
        backgroundColor: '#fef2f2',
    },
    sizeBox: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        backgroundColor: '#f9fafb',
    },
    sizeBoxActive: {
        backgroundColor: '#fed7aa', // orange-200
        borderColor: '#f97316', // orange-500
    },
    sizeBoxError: {
        borderColor: '#fca5a5',
    },
    sizeText: {
        color: '#374151',
    },
    sizeTextActive: {
        color: '#ea580c',
        fontWeight: 'bold',
    },
    submitBtn: {
        backgroundColor: '#000',
        borderRadius: 4,
        marginTop: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#4b5563',
    },
});

export default AddProductScreen;

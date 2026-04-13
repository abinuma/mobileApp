import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
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
    
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Track image1 specifically since it's the required one
    useEffect(() => {
        console.log(`[Diagnostic State Change] image1 is now: ${image1 ? "SET (uri: " + image1.uri.substring(0, 30) + "...)" : "NULL"}`);
    }, [image1]);

    const clearFieldError = (field) => {
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    const pickImage = async (setter, fieldName) => {
        try {
            console.log(`[Diagnostic] Launching image picker for ${fieldName}`);
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [3, 4],
                quality: 0.8,
            });

            console.log(`[Diagnostic] Picker result for ${fieldName}:`, result.canceled ? "Canceled" : "Success (assets: " + result.assets?.length + ")");

            if (!result.canceled && result.assets && result.assets.length > 0) {
                console.log(`[Diagnostic] Setting ${fieldName} to:`, result.assets[0].uri);
                setter(result.assets[0]);
                clearFieldError(fieldName);
                clearBanner();
            }
        } catch (e) {
            console.error(`[Diagnostic Error] pickImage failed for ${fieldName}:`, e.message);
        }
    };

    const toggleSize = (size) => {
        setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size]);
    };

    const getFileForFormData = async (imageAsset, fieldName) => {
        if (!imageAsset) return null;

        try {
            if (Platform.OS === 'web') {
                console.log(`[Diagnostic] Processing WEB BLOB for ${fieldName}:`, imageAsset.uri);
                const response = await fetch(imageAsset.uri);
                const blob = await response.blob();
                
                // Get extension from mime type
                let extension = 'jpg';
                if (blob.type === 'image/png') extension = 'png';
                if (blob.type === 'image/gif') extension = 'gif';
                if (blob.type === 'image/webp') extension = 'webp';
                
                console.log(`[Diagnostic] Blob processed: type=${blob.type}, size=${blob.size}, detected_ext=${extension}`);
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
            console.error(`[Diagnostic Error] Failed to process ${fieldName}:`, e.message);
            return null;
        }
    };

    const onSubmitHandler = async () => {
        clearBanner();

        // Log all fields to see exactly what's going on
        console.log("[Diagnostic Validation Status]:", {
            name: name ? "PRESENT" : "MISSING",
            description: description ? "PRESENT" : "MISSING",
            price: price ? "PRESENT" : "MISSING",
            image1: image1 ? "PRESENT" : "MISSING",
            image1_uri: image1?.uri || "N/A"
        });

        // Validate and highlight missing fields
        const errors = {};
        const missing = [];

        if (!name) { errors.name = true; missing.push("Name"); }
        if (!description) { errors.description = true; missing.push("Description"); }
        if (!price) { errors.price = true; missing.push("Price"); }
        if (!image1) { errors.image1 = true; missing.push("First Image"); }

        if (missing.length > 0) {
            console.warn("[Diagnostic Result] Validation failed. Missing items:", missing);
            setFieldErrors(errors);
            showBanner(`Please provide: ${missing.join(", ")}.`, "error");
            return;
        }

        setFieldErrors({});
        setLoading(true);
        console.log("[Diagnostic Start] Beginning Product Addition flow");

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
            formData.append("bestseller", "false"); 
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

            console.log(`[API Call] Sending POST to: ${backendUrl}/api/product/add`);
            
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
                showBanner("Product added successfully! 🎉", "success");
                setName("");
                setDescription("");
                setImage1(null);
                setImage2(null);
                setImage3(null);
                setImage4(null);
                setPrice("");
                setSizes([]);
            } else {
                console.error('[API Business Error] Message:', response.data.message);
                showBanner(response.data.message || "Failed to add product.", "error");
            }

        } catch (error) {
            console.error('[API Connection Error]:', error.response?.data || error.message);
            const msg = error.response?.data?.message || error.message;
            if (msg.includes('Network Error')) {
                showBanner("Unable to connect to server. Check your internet.", "error");
            } else {
                showBanner(msg || "Something went wrong. Please try again.", "error");
            }
        } finally {
            setLoading(false);
            console.log("[Diagnostic End] Flow completed");
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

            <Text style={styles.label}>Product Sizes</Text>
            <View style={styles.sizesRow}>
                {["S", "M", "L", "XL", "XXL"].map((sizeObj) => (
                    <TouchableOpacity 
                        key={sizeObj} 
                        style={[styles.sizeBox, sizes.includes(sizeObj) && styles.sizeBoxActive]}
                        onPress={() => toggleSize(sizeObj)}
                    >
                        <Text style={[styles.sizeText, sizes.includes(sizeObj) && styles.sizeTextActive]}>{sizeObj}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Button 
                mode="contained" 
                onPress={onSubmitHandler} 
                loading={loading}
                disabled={loading}
                style={styles.submitBtn}
                contentStyle={{ paddingVertical: 8 }}
            >
                {loading ? "ADDING..." : "ADD PRODUCT"}
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
});

export default AddProductScreen;

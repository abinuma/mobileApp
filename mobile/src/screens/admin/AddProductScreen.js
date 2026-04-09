import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { ShopContext } from '../../context/ShopContext';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Move ImageBox outside to prevent re-mounts on every state change
const ImageBox = ({ image, onPress }) => (
    <TouchableOpacity style={styles.imageBox} onPress={onPress}>
        {image ? (
            <Image 
                source={{ uri: image.uri }} 
                style={styles.previewImage} 
                key={image.uri} // Ensure refresh on URI change
            />
        ) : (
            <View style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>+</Text>
            </View>
        )}
    </TouchableOpacity>
);

const AddProductScreen = () => {
    const { backendUrl } = useContext(ShopContext);
    
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

    // Track image1 specifically since it's the required one
    useEffect(() => {
        console.log(`[Diagnostic State Change] image1 is now: ${image1 ? "SET (uri: " + image1.uri.substring(0, 30) + "...)" : "NULL"}`);
    }, [image1]);

    const pickImage = async (setter, name) => {
        try {
            console.log(`[Diagnostic] Launching image picker for ${name}`);
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [3, 4],
                quality: 0.8,
            });

            console.log(`[Diagnostic] Picker result for ${name}:`, result.canceled ? "Canceled" : "Success (assets: " + result.assets?.length + ")");

            if (!result.canceled && result.assets && result.assets.length > 0) {
                console.log(`[Diagnostic] Setting ${name} to:`, result.assets[0].uri);
                setter(result.assets[0]);
            }
        } catch (e) {
            console.error(`[Diagnostic Error] pickImage failed for ${name}:`, e.message);
        }
    };

    const toggleSize = (size) => {
        setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size]);
    };

    const getFileForFormData = async (imageAsset, fieldName) => {
        if (!imageAsset) return null;

        try {
            if (Platform.OS === 'web') {
                const response = await fetch(imageAsset.uri);
                const blob = await response.blob();
                const fileType = imageAsset.uri.split('.').pop() || 'jpg';
                return new File([blob], `${fieldName}.${fileType}`, { type: blob.type });
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
        // Detailed check for exactly what is missing
        if (!name || !description || !price || !image1) {
            let missing = [];
            if (!name) missing.push("Name");
            if (!description) missing.push("Description");
            if (!price) missing.push("Price");
            if (!image1) missing.push("First Image");
            
            console.warn("[Diagnostic Result] Validation failed:", { missing, image1Status: !!image1 });
            Alert.alert("Missing Information", `Please provide: ${missing.join(", ")}.`);
            return;
        }

        setLoading(true);
        console.log("[Diagnostic Start] Beginning Product Addition flow");

        try {
            const adminToken = await AsyncStorage.getItem('adminToken');
            
            if (!adminToken) {
                Alert.alert("Error", "Admin Token Missing. Please log in again.");
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
                Alert.alert("Success", "Product added successfully");
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
                Alert.alert("Error", response.data.message);
            }

        } catch (error) {
            console.error('[API Connection Error]:', error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
            console.log("[Diagnostic End] Flow completed");
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.label}>Upload Image (Box 1 Mandatory)</Text>
            <View style={styles.imagesRow}>
                <ImageBox image={image1} onPress={() => pickImage(setImage1, "image1")} />
                <ImageBox image={image2} onPress={() => pickImage(setImage2, "image2")} />
                <ImageBox image={image3} onPress={() => pickImage(setImage3, "image3")} />
                <ImageBox image={image4} onPress={() => pickImage(setImage4, "image4")} />
            </View>

            <TextInput
                mode="outlined"
                label="Product name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />

            <TextInput
                mode="outlined"
                label="Product description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={styles.input}
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
                onChangeText={setPrice}
                keyboardType="numeric"
                style={styles.input}
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

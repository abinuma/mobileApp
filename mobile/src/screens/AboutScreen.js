import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleWrapper}>
          <Title text1={"ABOUT"} text2={"US"} />
        </View>

        <View style={styles.contentSection}>
          <View style={styles.imagePlaceholder}>
             <Text style={styles.placeholderText}>Brand Story Image</Text>
          </View>
          
          <View style={styles.textContent}>
            <Text style={styles.description}>
              Forever was born out of a passion for customer satisfaction and a desire to revolutionize the way people shop. Our journey started with a simple idea: to provide high-quality products that cater to your unique style and needs.
            </Text>
            <Text style={styles.description}>
              Since our inception, we’ve worked tirelessly to curate a diverse selection of premium products that range from everyday essentials to statement pieces.
            </Text>
            
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.description}>
              Our mission at Forever is to empower customers with choice, convenience, and confidence. We’re dedicated to providing a seamless shopping experience that exceeds expectations, from browsing to delivery.
            </Text>
          </View>
        </View>

        <View style={styles.titleWrapper}>
           <Title text1={"WHY"} text2={"CHOOSE US"} />
        </View>

        <View style={styles.whyBoxContainer}>
            <View style={styles.whyBox}>
                <Text style={styles.whyTitle}>Quality Assurance:</Text>
                <Text style={styles.whyText}>We meticulously select and vet each product to ensure it meets our stringent quality standards.</Text>
            </View>
            <View style={styles.whyBox}>
                <Text style={styles.whyTitle}>Convenience:</Text>
                <Text style={styles.whyText}>With our user-friendly interface and hassle-free ordering process, shopping has never been easier.</Text>
            </View>
            <View style={[styles.whyBox, { borderBottomWidth: 0 }]}>
                <Text style={styles.whyTitle}>Exceptional Customer Service:</Text>
                <Text style={styles.whyText}>Our team of dedicated professionals is here to assist you every step of the way, ensuring your satisfaction is our top priority.</Text>
            </View>
        </View>

        <NewsletterBox />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleWrapper: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  contentSection: {
    paddingHorizontal: 16,
    marginBottom: 48,
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  textContent: {
    gap: 16,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  whyBoxContainer: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 48,
  },
  whyBox: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  whyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  whyText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
});

export default AboutScreen;

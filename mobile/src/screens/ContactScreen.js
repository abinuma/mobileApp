import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import { MapPin, Phone, Mail } from 'lucide-react-native';

const ContactScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleWrapper}>
          <Title text1={"CONTACT"} text2={"US"} />
        </View>

        <View style={styles.contentSection}>
          <View style={styles.imagePlaceholder}>
             <Text style={styles.placeholderText}>Store Front/Map Image</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Our Store</Text>
            
            <View style={styles.infoRow}>
              <MapPin color="#4b5563" size={20} />
              <Text style={styles.infoText}>54709 Williams Station{"\n"}Suite 350, Washington, USA</Text>
            </View>

            <View style={styles.infoRow}>
              <Phone color="#4b5563" size={20} />
              <Text style={styles.infoText}>Tel: (415) 555-0132</Text>
            </View>

            <View style={styles.infoRow}>
              <Mail color="#4b5563" size={20} />
              <Text style={styles.infoText}>Email: admin@forever.com</Text>
            </View>

            <Text style={styles.cardTitleSecondary}>Careers at Forever</Text>
            <Text style={styles.description}>
              Learn more about our teams and job openings.
            </Text>

            <TouchableOpacity style={styles.exploreBtn}>
                <Text style={styles.exploreBtnText}>Explore Jobs</Text>
            </TouchableOpacity>
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
    flexDirection: 'column',
    gap: 24,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  card: {
    gap: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  cardTitleSecondary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  exploreBtn: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});

export default ContactScreen;

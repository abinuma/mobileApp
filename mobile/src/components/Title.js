import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Title = ({ text1, text2 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text1}>
        {text1} <Text style={styles.text2}>{text2}</Text>
      </Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  text1: {
    color: '#6b7280', // gray-500
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  text2: {
    color: '#1f2937', // gray-800
    fontWeight: 'bold',
  },
  line: {
    height: 2,
    width: 32,
    backgroundColor: '#4b5563', // gray-600
    marginLeft: 8,
  },
});

export default Title;

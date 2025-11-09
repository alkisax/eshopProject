// native-eshop-project\app\cart\index.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import CartItemsListNative from '../../components/CartItemsListNative'

const CartScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Καλάθι Αγορών</Text>
      <CartItemsListNative />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf7',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#4a3f35',
  },
});

export default CartScreen;

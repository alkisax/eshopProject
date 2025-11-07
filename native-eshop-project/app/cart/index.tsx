import { View, Text, StyleSheet } from 'react-native';

const CartScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🛒 This is the Cart screen (placeholder)</Text>
    </View>
  );
}

export default CartScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffdf7',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});
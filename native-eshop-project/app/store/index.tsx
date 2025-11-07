import { View, Text, StyleSheet } from 'react-native';

const FavoritesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🛒 This is the Store screen (placeholder)</Text>
    </View>
  );
}

export default FavoritesScreen

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
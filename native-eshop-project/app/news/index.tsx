import { View, Text, StyleSheet } from 'react-native';

const NewsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🛒 This is the News screen (placeholder)</Text>
    </View>
  );
}

export default NewsScreen

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
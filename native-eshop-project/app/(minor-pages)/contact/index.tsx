import { View, Text, StyleSheet } from 'react-native';

const ContactScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🛒 This is the Contact screen (placeholder)</Text>
    </View>
  );
}

export default ContactScreen

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
// native-eshop-project/app/checkout-cancel/index.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

const CheckoutCancel = () => {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>❌</Text>
      <Text style={styles.title}>Η πληρωμή ακυρώθηκε</Text>
      <Text style={styles.subtitle}>
        Δεν ολοκληρώθηκε η συναλλαγή σας. Μπορείτε να δοκιμάσετε ξανά ή να
        συνεχίσετε τις αγορές σας.
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.retryBtn]}
        onPress={() => router.replace('/cart')}
      >
        <Text style={styles.buttonText}>Επιστροφή στο Καλάθι</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.outlineBtn]}
        onPress={() => router.replace('/store')}
      >
        <Text style={styles.outlineText}>Συνέχεια Αγορών</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#a33',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '85%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: '#48C4CF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#48C4CF',
    backgroundColor: '#fff',
  },
  outlineText: {
    color: '#48C4CF',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default CheckoutCancel

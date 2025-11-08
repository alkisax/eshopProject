// native-eshop-project/app/login/index.tsx
import React, { useContext, useEffect } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import LoginBackendNative from '../../components/LoginBackendNative';
import { UserAuthContext } from '@/context/UserAuthContext';

const LoginScreen = () => {
  const { user } = useContext(UserAuthContext);
  const router = useRouter();

  // If already logged in, don't show login screen
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Σύνδεση</Text>
      <Text style={styles.subtitle}>
        Συνδεθείτε για να δείτε παραγγελίες και αγαπημένα.
      </Text>

      <LoginBackendNative />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4a3f35',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default LoginScreen;

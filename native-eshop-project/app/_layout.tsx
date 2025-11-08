// native-eshop-project\app\_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import {  StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';
import { VariablesProvider } from '@/context/VariablesContext';
import { AiModerationProvider } from '@/context/AiModerationContext';
// import { CartActionsProvider } from '@/context/CartActionsContext';  // will add later
// import { UserAuthProvider } from '@/context/UserAuthContext'; 

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <VariablesProvider>
        <AiModerationProvider>
          <SafeAreaView style={styles.container}>
            {/* Custom header visible on all screens */}
            <Navbar />

            {/* Stack Navigator (Expo Router) */}
            <Stack
              screenOptions={{
                headerShown: false, // disable default header
              }}          
            >
              <Stack.Screen name="index" options={{ title: 'Αρχική' }} />
              <Stack.Screen name="store/index" options={{ title: 'Κατάστημα' }} />
              <Stack.Screen name="cart/index" options={{ title: 'Καλάθι' }} />
              <Stack.Screen name="favorites/index" options={{ title: 'Αγαπημένα' }} />

              <Stack.Screen name="commodity/[id]/index" options={{ title: 'Προϊόν' }} />

              <Stack.Screen name="profile/index" options={{ title: 'Προφίλ' }} />
              <Stack.Screen name="login/index" options={{ title: 'Σύνδεση' }} />

              <Stack.Screen name="news/index" options={{ title: 'Νέα' }} />
              <Stack.Screen name="announcements/index" options={{ title: 'Ανακοινώσεις' }} />
              <Stack.Screen name="posts/[id]" options={{ title: 'Ανακοίνωση' }} />           

              <Stack.Screen name="(minor-pages)/payment-methods/index" options={{ title: 'Τρόποι Πληρωμής' }} />
              <Stack.Screen name="(minor-pages)/shipping-methods/index" options={{ title: 'Τρόποι Αποστολής' }} />
              <Stack.Screen name="(minor-pages)/terms/index" options={{ title: 'Όροι Χρήσης' }} />
              <Stack.Screen name="(minor-pages)/contact/index" options={{ title: 'Επικοινωνία' }} />
              <Stack.Screen name="(minor-pages)/privacy-policy/index" options={{ title: 'Πολιτική Απορρήτου' }} />
              <Stack.Screen name="(minor-pages)/return-policy/index" options={{ title: 'Πολιτική Επιστροφών' }} />
              <Stack.Screen name="(minor-pages)/cookie-policy/index" options={{ title: 'Πολιτική Cookies' }} />
            </Stack>

            <StatusBar barStyle="dark-content" />
          </SafeAreaView>            
        </AiModerationProvider>
      
      </VariablesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default RootLayout

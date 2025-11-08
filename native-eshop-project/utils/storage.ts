// native-eshop-project\utils\storage.ts
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// Save token or any key/value
export const saveItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value)
  } else {
    await SecureStore.setItemAsync(key, value)
  }
}

// Retrieve token or value
export const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key)
  }
  return await SecureStore.getItemAsync(key)
}

// Delete token
export const deleteItem = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key)
  } else {
    await SecureStore.deleteItemAsync(key)
  }
}

export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token')
  }
  return await SecureStore.getItemAsync('token')
}

export const setToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token)
    return
  }
  await SecureStore.setItemAsync('token', token)
}

export const deleteToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('token')
    return
  }
  await SecureStore.deleteItemAsync('token')
}

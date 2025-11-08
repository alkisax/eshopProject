
// native-eshop-project\app\favorites\index.tsx

import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import axios from 'axios'
import { getItem } from '@/utils/storage'
import { useRouter } from 'expo-router'
import { UserAuthContext } from '@/context/UserAuthContext'
import { VariablesContext } from '@/context/VariablesContext'
import type { CommodityType } from '@/types/commerce.types'

const FavoritesScreen = () => {
  const { user } = useContext(UserAuthContext)
  const { url, setHasFavorites } = useContext(VariablesContext)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [favoriteCommodities, setFavoriteCommodities] = useState<CommodityType[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?._id) {
        setLoading(false)
        return
      }

      const token = await getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await axios.get(`${url}/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const favs: string[] = res.data.data.favorites || []
        setFavoriteIds(favs)
        setHasFavorites(favs.length > 0)
      } catch (err) {
        console.error('Failed to fetch favorites', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user, url, setHasFavorites])

  useEffect(() => {
    const fetchCommodities = async () => {
      if (favoriteIds.length === 0) {
        setFavoriteCommodities([])
        return
      }

      try {
        const promises = favoriteIds.map((id) =>
          axios.get<{ status: boolean; data: CommodityType }>(`${url}/api/commodity/${id}`)
        )
        const results = await Promise.all(promises)
        const commodities = results.map((r) => r.data.data)
        setFavoriteCommodities(commodities)
      } catch (err) {
        console.error('Failed to fetch commodity details', err)
        setFavoriteCommodities([])
      }
    }

    fetchCommodities()
  }, [favoriteIds, url])

  const handleRemoveFavorite = async (commodityId: string) => {
    const userId = user?._id
    if (!userId) return

    const token = await getItem('token')
    if (!token) return

    try {
      await axios.delete(`${url}/api/users/${userId}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { commodityId },
      })

      setFavoriteIds((prev) => {
        const updated = prev.filter((id) => id !== commodityId)
        setHasFavorites(updated.length > 0)
        return updated
      })

      Alert.alert('🗑️', 'Αφαιρέθηκε από τα αγαπημένα')
    } catch (err) {
      console.error('Failed to remove favorite', err)
    }
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Πρέπει να συνδεθείτε για να δείτε τα αγαπημένα.</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3f35" />
      </View>
    )
  }

  if (favoriteCommodities.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Δεν έχετε αγαπημένα προϊόντα ακόμα.</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Αγαπημένα</Text>

      {favoriteCommodities.map((c) => (
        <View key={c._id} style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/commodity/${c._id}`)}
          >
            <Image
              source={{ uri: c.images?.[0] || 'https://via.placeholder.com/150' }}
              style={styles.image}
            />
            <Text style={styles.name}>{c.name}</Text>
            <Text style={styles.price}>
              {c.price} {c.currency}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemoveFavorite(c._id.toString())}
          >
            <Text style={styles.removeText}>Αφαίρεση ❤️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fffdf7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffdf7',
  },
  info: {
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a3f35',
    marginBottom: 16,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  removeBtn: {
    borderWidth: 1.5,
    borderColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  removeText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
})

export default FavoritesScreen

// native-eshop-project\app\commodity\[id]\index.tsx

import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { VariablesContext } from '@/context/VariablesContext';
import { AiModerationContext } from '@/context/AiModerationContext';
import { CartActionsContext } from '@/context/CartActionsContext';
import type { CommodityType } from '@/types/commerce.types';
import CommodityReviews from '@/components/CommodityReviews';
import SuggestedCommodities from '@/components/SuggestedCommodities';
import { UserAuthContext } from '@/context/UserAuthContext'
import { getItem } from '@/utils/storage'

/*
  📦 CommodityPage (Native)
  - Fetches a single commodity by ID
  - Shows name, main image, description, price, and stock
  - Displays clickable thumbnails for other images
  - Add to Cart / Favorites
*/

const CommodityPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { url } = useContext(VariablesContext);
  const { aiModerationEnabled } = useContext(AiModerationContext);
  const { addOneToCart, loadingItemId } = useContext(CartActionsContext);
  const { user } = useContext(UserAuthContext)
  const { setHasFavorites } = useContext(VariablesContext)

  const [commodity, setCommodity] = useState<CommodityType | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // === Fetch commodity ===
  const fetchCommodity = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/commodity/${id}`);
      const data: CommodityType = res.data.data;
      setCommodity(data);
      if (data.images?.length) setSelectedImage(data.images[0]);
    } catch (err) {
      console.error('❌ Failed to fetch commodity:', err);
      setError('Αποτυχία φόρτωσης προϊόντος.');
    } finally {
      setLoading(false);
    }
  }, [id, url]);

  useEffect(() => {
    fetchCommodity();
  }, [fetchCommodity]);

  // === see if its already favorite ===
  useEffect(() => {
    const fetchFavoritesStatus = async () => {
      const userId = user?._id
      if (!userId || !commodity?._id) return

      const token = await getItem('token')
      if (!token) return

      try {
        const res = await axios.get(`${url}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const favs: string[] = res.data.data.favorites || []
        setIsFavorite(favs.includes(commodity._id.toString()))
      } catch (err) {
        console.error('Failed to check favorites', err)
      }
    }
    fetchFavoritesStatus()
  }, [user, commodity, url])

  // === Handlers ===
  const handleAddToCart = async () => {
    if (!commodity?._id) return;
    try {
      await addOneToCart(commodity._id);
      Alert.alert('🛒', 'Το προϊόν προστέθηκε στο καλάθι.');
    } catch (err) {
      console.error('Error adding to cart', err);
      Alert.alert('Σφάλμα', 'Δεν ήταν δυνατή η προσθήκη στο καλάθι.');
    }
  };

  const handleAddToFavorites = async () => {
    const userId = user?._id
    if (!userId || !commodity?._id) {
      Alert.alert('Πρέπει να συνδεθείτε πρώτα')
      return
    }

    const token = await getItem('token')
    if (!token) return

    try {
      await axios.post(
        `${url}/api/users/${userId}/favorites`,
        { commodityId: commodity._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHasFavorites(true)
      setIsFavorite(true)
      Alert.alert('❤️', 'Προστέθηκε στα αγαπημένα')
    } catch (err) {
      console.error('Failed to add favorite', err)
    }
  }

  const handleRemoveFromFavorites = async () => {
    const userId = user?._id
    if (!userId || !commodity?._id) return

    const token = await getItem('token')
    if (!token) return

    try {
      await axios.delete(`${url}/api/users/${userId}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { commodityId: commodity._id },
      })
      setIsFavorite(false)

      // ✅ re-check favorites count
      const res = await axios.get(`${url}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const favs = res.data.data.favorites || []
      setHasFavorites(favs.length > 0)
      Alert.alert('🗑️', 'Αφαιρέθηκε από τα αγαπημένα')
    } catch (err) {
      console.error('Failed to remove favorite', err)
    }
  }

  // === UI States ===
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3f35" />
        <Text style={styles.loadingText}>Φόρτωση προϊόντος...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!commodity) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Δεν βρέθηκε προϊόν.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{commodity.name}</Text>

      {/* === Main Image === */}
      {selectedImage ? (
        <Image
          source={{ uri: selectedImage }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      {/* === Thumbnails === */}
      {commodity.images && commodity.images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsRow}
        >
          {commodity.images.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedImage(img)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: img }}
                style={[
                  styles.thumbnail,
                  img === selectedImage && styles.thumbnailSelected,
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* === Price === */}
      <Text style={styles.price}>
        {new Intl.NumberFormat('el-GR', {
          style: 'currency',
          currency: 'EUR',
        }).format(commodity.price)}
      </Text>

      {/* === Description === */}
      <Text style={styles.description}>
        {commodity.description || 'Δεν υπάρχει περιγραφή.'}
      </Text>

      {/* === Stock === */}
      <Text style={styles.stock}>
        {commodity.stock > 0
          ? `Διαθέσιμο (${commodity.stock} τεμάχια)`
          : 'Μη διαθέσιμο'}
      </Text>

      {/* === Add to Cart === */}
      <TouchableOpacity
        style={[
          styles.button,
          (commodity.stock === 0 || loadingItemId === commodity._id) &&
            styles.buttonDisabled,
        ]}
        disabled={commodity.stock === 0 || loadingItemId === commodity._id}
        onPress={handleAddToCart}
      >
        {loadingItemId === commodity._id ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
         {commodity.stock === 0 ? 'Μη διαθέσιμο' : 'Προσθήκη στο καλάθι'}
          </Text>
        )}
      </TouchableOpacity>

      {/* === Favorites === */}
      <TouchableOpacity
        style={[styles.buttonOutline, styles.spacedButton]}
        onPress={isFavorite ? handleRemoveFromFavorites : handleAddToFavorites}
      >
        <Text style={styles.buttonOutlineText}>
          {isFavorite ? 'Αφαίρεση από αγαπημένα ❤️' : 'Προσθήκη στα αγαπημένα ♡'}
        </Text>
      </TouchableOpacity>

      {/* === Ai Suggestions === */}
      <TouchableOpacity
        style={[styles.buttonOutline, styles.spacedButton]}
        onPress={() => setShowSuggestions((prev) => !prev)}
      >
        <Text style={styles.buttonOutlineText}>
          {showSuggestions ? 'Απόκρυψη προτάσεων' : 'Δείξε προτάσεις'}
        </Text>
      </TouchableOpacity>

      <SuggestedCommodities
        baseCommodity={commodity}
        visible={showSuggestions}
      />

      {/* === AI moderation info === */}
      {aiModerationEnabled && (
        <Text style={styles.moderationText}>
          AI Moderation ενεργό 
        </Text>
      )}

      <CommodityReviews commodityId={id as string} />
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffdf7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#666', marginTop: 8 },
  errorText: { color: '#a33', fontSize: 16 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d2d2d',
    marginBottom: 12,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  thumbnailSelected: {
    borderColor: '#48C4CF',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#999', fontSize: 14 },
  price: {
    fontSize: 20,
    color: '#48C4CF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
    textAlign: 'center',
  },
  stock: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#48C4CF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonDisabled: { backgroundColor: '#BFDDE0' },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: '#48C4CF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonOutlineText: {
    textAlign: 'center',
    color: '#48C4CF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  moderationText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  spacedButton: {
    marginTop: 8,
    paddingVertical: 12, 
    paddingHorizontal: 10,
  },
});

export default CommodityPage;

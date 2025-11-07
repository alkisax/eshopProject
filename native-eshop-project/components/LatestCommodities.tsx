// native-eshop-project\components\LatestCommodities.tsx

import React, { useEffect, useState, useContext } from 'react';
import { Text, Image, FlatList, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { VariablesContext } from '../context/VariablesContext';

const { width } = Dimensions.get('window');

interface CommodityType {
  _id: string;
  name: string;
  price: number;
  currency: string;
  images?: string[];
}

const LatestCommodities = () => {
  const router = useRouter();
  const [latest, setLatest] = useState<CommodityType[]>([]);
  const [loading, setLoading] = useState(true);

  const { url } = useContext(VariablesContext);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${url}/api/commodity/`);
        const all = res.data.data;
        const sorted = [...all].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLatest(sorted.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch commodities', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [url]);

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#4a3f35" />;
  }

  return (
    <FlatList
      data={latest}
      keyExtractor={(item) => item._id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.carousel}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.card, { width: width * 0.8 }]}
          onPress={() => router.push(`/commodity/${item._id}`)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image' }}
            style={styles.image}
          />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>
            {item.price} {item.currency}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  carousel: {
    marginTop: 24,
  },
  card: {
    marginHorizontal: width * 0.1 * 0.5,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  name: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  price: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});

export default LatestCommodities;

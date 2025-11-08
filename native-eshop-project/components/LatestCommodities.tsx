// native-eshop-project\components\LatestCommodities.tsx

import React, { useEffect, useState, useContext, useRef } from 'react';
import { Text, Image, Dimensions, StyleSheet, TouchableOpacity, ScrollView, Animated, View } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { VariablesContext } from '../context/VariablesContext';
import { CommodityType } from '../types/commerce.types'

const { width } = Dimensions.get('window');

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

  if (loading) return <LatestCommoditiesSkeleton />;

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={true}
      scrollEventThrottle={16}
      directionalLockEnabled={true}
      style={styles.carousel}
    >
      {latest.map((item) => (
        <TouchableOpacity
          key={item._id}
          style={[styles.card, { width: width * 0.8 }]}
          activeOpacity={0.8}
          onPress={() => router.push(`/commodity/${item._id}`)}
        >
          <Image
            source={{
              uri:
                item.images?.[0] ||
                'https://via.placeholder.com/300x300?text=No+Image',
            }}
            style={styles.image}
          />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>
            {item.price} {item.currency}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

/* ✅ Skeleton Component */
const LatestCommoditiesSkeleton = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['#eee', '#ddd'],
  });

  return (
    <View style={styles.skeletonContainer}>
      {[...Array(3)].map((_, i) => (
        <Animated.View key={i} style={[styles.skeletonCard, { backgroundColor }]} />
      ))}
    </View>
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
  /* --- skeleton styles --- */
  skeletonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  skeletonCard: {
    width: width * 0.7,
    height: 200,
    borderRadius: 12,
    marginHorizontal: 10,
  },
});

export default LatestCommodities;

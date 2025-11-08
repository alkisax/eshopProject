import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { VariablesContext } from '@/context/VariablesContext';
import type { CommodityType } from '@/types/commerce.types';

/*
  📦 SuggestedCommodities
  - Fetches semantic AI suggestions for a given commodity
  - Displays them in a horizontal scroll row
*/

interface Props {
  baseCommodity: CommodityType;
  visible: boolean;
}

interface SemanticSearchResult {
  commodity: CommodityType;
  score: number;
}

const SuggestedCommodities = ({ baseCommodity, visible }: Props) => {
  const { url } = useContext(VariablesContext);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState<CommodityType[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!visible || !baseCommodity?._id) return;

      try {
        setLoading(true);
        const res = await axios.get<{ status: boolean; data: SemanticSearchResult[] }>(
          `${url}/api/ai-embeddings/search`,
          { params: { query: baseCommodity.name } }
        );
        const items = res.data.data.map((r) => r.commodity);
        setSuggested(items.filter((s) => s._id !== baseCommodity._id).slice(0, 3));
      } catch (err) {
        console.error('❌ Error fetching AI suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [visible, baseCommodity, url]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Προτάσεις για εσάς</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#4a3f35" style={{ marginTop: 8 }} />
      ) : suggested.length === 0 ? (
        <Text style={styles.noData}>Δεν βρέθηκαν παρόμοια προϊόντα.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollRow}
        >
          {suggested.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/commodity/${item._id}`)}
            >
              <Image
                source={{
                  uri:
                    item.images?.[0] ||
                    'https://via.placeholder.com/150x150?text=No+Image',
                }}
                style={styles.image}
                resizeMode="cover"
              />
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.price}>
                {new Intl.NumberFormat('el-GR', {
                  style: 'currency',
                  currency: item.currency?.toUpperCase() || 'EUR',
                }).format(item.price)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  card: {
    width: 140,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginBottom: 6,
  },
  noData: {
    textAlign: 'center',
    color: '#777',
    marginTop: 8,
  },
});

export default SuggestedCommodities;

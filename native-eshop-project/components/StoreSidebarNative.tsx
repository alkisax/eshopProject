// native-eshop-project/components/StoreSidebarNative.tsx
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import type { CategoryType, CommodityType } from '@/types/commerce.types';
import { useContext, useState } from 'react';
import { VariablesContext } from '@/context/VariablesContext';
import axios from 'axios';

/*
  📦 StoreSidebarNative
  - Displays categories as checkboxes
  - "Apply" and "Clear" buttons
  - Reusable modal controlled by parent
*/

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: CategoryType[];
  selectedCategories: string[];
  onToggleCategory: (id: string, checked: boolean) => void;
  onApply: (semanticResults?: CommodityType[]) => void;
  onClear: () => void;
}

const StoreSidebarNative = ({
  visible,
  onClose,
  categories,
  selectedCategories,
  onToggleCategory,
  onApply,
  onClear,
}: Props) => {

  const { url } = useContext(VariablesContext);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) {
      Alert.alert('❗', 'Παρακαλώ εισάγετε όρο για semantic search.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get<{ status: boolean; data: { commodity: CommodityType; score: number }[] }>(
        `${url}/api/ai-embeddings/search`,
        { params: { query: semanticQuery } }
      );

      console.log('🔍 Semantic query:', semanticQuery);
      console.log('🧾 Full API raw response:', res.data);
      console.log('🧾 Returned data length:', res.data.data?.length);

      const results = res.data.data.map(r => r.commodity);
      onApply(results);
      onClose();
    } catch (err) {
      console.error('Semantic search failed:', err);
      Alert.alert('Σφάλμα', 'Αποτυχία semantic search.');
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.header}>Φίλτρα Κατηγοριών</Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Semantic Search */}
          <Text style={styles.label}>Semantic Search (AI)</Text>
          <View style={styles.semanticRow}>
            <TextInput
              style={styles.input}
              placeholder="π.χ. ασημένιο δαχτυλίδι με πέτρα"
              value={semanticQuery}
              onChangeText={setSemanticQuery}
            />
            <TouchableOpacity
              style={styles.semanticButton}
              onPress={handleSemanticSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.semanticButtonText}>AI</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Categories */}
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={styles.categoryRow}
              activeOpacity={0.7}
              onPress={() =>
                onToggleCategory(cat.name, !selectedCategories.includes(cat.name))
              }
            >
              <Checkbox
                status={
                  selectedCategories.includes(cat.name)
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() =>
                  onToggleCategory(cat.name, !selectedCategories.includes(cat.name))
                }
              />
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <Text style={styles.clearText}>Καθαρισμός</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => onApply()} // ✅ wrap to avoid event argument
          >
            <Text style={styles.applyText}>Εφαρμογή</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffdf7', padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a3f35',
    textAlign: 'center',
    marginBottom: 12,
  },
  scroll: { flex: 1, marginBottom: 16 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  categoryText: { fontSize: 16, color: '#333' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#48C4CF',
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#FFD500',
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearText: {
    color: '#4a3f35',
    fontWeight: 'bold',
    fontSize: 16,
  },
    semanticRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  semanticButton: {
    marginLeft: 8,
    backgroundColor: '#48C4CF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  semanticButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
  },
});

export default StoreSidebarNative;

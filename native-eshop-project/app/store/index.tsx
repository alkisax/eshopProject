// native-eshop-project/app/store/index.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { VariablesContext } from '@/context/VariablesContext';
import type { CommodityType, CategoryType } from '@/types/commerce.types';
import { useRouter } from 'expo-router';
import StoreSidebarNative from '@/components/StoreSidebarNative';

const ITEMS_PER_PAGE = 10;

const StoreScreen = () => {
  const { url } = useContext(VariablesContext);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [commodities, setCommodities] = useState<CommodityType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<CommodityType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [semanticResults, setSemanticResults] = useState<CommodityType[] | null>(null);

  // Fetch commodities
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/api/commodity`);
        setCommodities(res.data.data);
      } catch (err) {
        console.error('Error fetching commodities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${url}/api/category`);
        const all: CategoryType[] = res.data.data;
        setCategories(all.filter((c) => !c.parent && !c.isTag));
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, [url]);

  useEffect(() => {
    console.log('Selected categories:', selectedCategories);
    console.log('Commodity sample:', commodities[0]?.category);
  }, [commodities, selectedCategories]);

  // 🔍 Filter logic
  useEffect(() => {
    let result = commodities;

    if (selectedCategories.length > 0) {
      result = result.filter((c) => {
        const cat = c.category as CategoryType | string | string[];

        if (typeof cat === 'string') {
          return selectedCategories.includes(cat);
        }

        if (Array.isArray(cat)) {
          // could be string[] or CategoryType[]
          const first = cat[0];
          if (typeof first === 'string') {
            return cat.some((id) => selectedCategories.includes(id));
          } else {
            // array of objects (CategoryType[])
            return cat.some((obj) => {
              if (typeof obj === 'string') {
                return selectedCategories.includes(obj);
              }
              return selectedCategories.includes((obj as CategoryType)._id);
            });
          }
        }

        if (typeof cat === 'object' && cat?._id) {
          return selectedCategories.includes(cat._id);
        }

        return false;
      });
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(lower));
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [commodities, search, selectedCategories]);

  const handleApplyFilters = (results?: CommodityType[]) => {
    if (results?.length) {
      console.log('🧠 AI results applied:', results.length);
      setSemanticResults(results);
      setFiltered(results);
    } else {
      setSemanticResults(null);
      let result = commodities;

      if (selectedCategories.length) {
        result = result.filter((c) => {
          const cat = c.category;
          if (typeof cat === 'string') return selectedCategories.includes(cat);
          if (Array.isArray(cat))
            return cat.some((x) =>
              typeof x === 'string'
                ? selectedCategories.includes(x)
                : selectedCategories.includes((x as CategoryType)._id)
            );
          return (
            typeof cat === 'object' &&
            cat !== null &&
            selectedCategories.includes((cat as CategoryType)._id)
          );
        });
      }

      if (search.trim())
        result = result.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        );

      setFiltered(result);
    }

    setCurrentPage(1);
    setFiltersVisible(false);
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleToggleCategory = (catId: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, catId] : prev.filter((id) => id !== catId)
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearch('');
    setFiltered(commodities);
    setCurrentPage(1);
    setFiltersVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3f35" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Κατάστημα</Text>

        <View style={styles.topBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Αναζήτηση προϊόντων..."
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFiltersVisible(true)}
          >
            <Text style={styles.filterText}>Φίλτρα</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={paginated}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/commodity/${item._id}`)}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri:
                    item.images?.[0] ||
                    'https://via.placeholder.com/200x200?text=No+Image',
                }}
                style={styles.image}
              />
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.price}>
                {item.price} {item.currency}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => item._id ?? String(index)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ padding: 16 }}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}
              onPress={handlePrev}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.pageText}>
              {currentPage} από {totalPages}
            </Text>

            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.pageButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sidebar Modal */}
      <StoreSidebarNative
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onApply={handleApplyFilters}   // ✅ here
        onClear={handleClearFilters}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffdf7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: '#2d2d2d',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  filterButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#48C4CF',
    borderRadius: 8,
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    padding: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#EAF8F9',
  },
  pageButton: {
    backgroundColor: '#48C4CF',
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: '#BFDDE0',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  pageText: {
    fontSize: 16,
    color: '#48C4CF',
    fontWeight: '600',
  },
});

export default StoreScreen;

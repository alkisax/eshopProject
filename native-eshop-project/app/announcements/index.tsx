// native-eshop-project/app/announcements/index.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { VariablesContext } from '@/context/VariablesContext';
import RenderedEditorJsContent from '@/components/RenderedEditorJsContent';
import { getPreviewContent } from '../../utils/editorHelper';
import type { PostType, EditorJsContent } from '@/types/blogTypes';

/*
  📄 Native version of Announcements page
  - Fetches /api/posts
  - Filters where subPage.name === 'announcements'
  - Displays title, preview, date
  - Navigates to /posts/[id]
*/

const AnnouncementsScreen = () => {
  const { url } = useContext(VariablesContext);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/posts`);
        const all: PostType[] = response.data.data || response.data;

        // ✅ Filter announcements only
        const announcements = all.filter(
          (p) => typeof p.subPage === 'object' && p.subPage?.name === 'announcements'
        );

        setPosts(announcements);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [url]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3f35" />
      </View>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Δεν βρέθηκαν ανακοινώσεις.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: PostType }) => {
    const preview: EditorJsContent = getPreviewContent(item.content);
    const firstImage = preview.blocks.find((b) => b.type === 'image') as any;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/posts/${item.slug || item._id}`)}
      >
        {firstImage?.data?.file?.url && (
          <Image
            source={{ uri: firstImage.data.file.url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.body}>
          <Text style={styles.title}>{item.title}</Text>
          <RenderedEditorJsContent
            editorJsData={preview}
            subPageName={typeof item.subPage === 'object' ? item.subPage.name : ''}
          />
          <Text style={styles.date}>
            {new Date(item.createdAt!).toLocaleString('el-GR')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Νέα από το Εργαστήρι</Text>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id ?? String(index)}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffdf7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#555' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#2d2d2d',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 180 },
  body: { padding: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  date: { fontSize: 12, color: 'gray', marginTop: 4 },
});

export default AnnouncementsScreen;

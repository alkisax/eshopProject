// native-eshop-project/app/posts/[id]/index.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { VariablesContext } from '@/context/VariablesContext';
import RenderedEditorJsContent from '@/components/RenderedEditorJsContent';
import type { PostType, EditorJsContent } from '../../../types/blogTypes';

/*
  📄 Native version of BlogPost (from web)
  - Uses useLocalSearchParams instead of useParams
  - Detects if param is slug or ObjectId
  - Fetches post from correct endpoint
  - Displays title, date, and rendered content
*/

const BlogPostScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { url } = useContext(VariablesContext);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostType | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        setLoading(true);

        // ✅ Detect slug vs Mongo ObjectId (24-char hex)
        let endpoint = `${url}/api/posts/${id}`;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          endpoint = `${url}/api/posts/slug/${id}`;
        }

        const response = await axios.get(endpoint);
        const postData: PostType = response.data.data || response.data;
        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, url]);

  // --- Loading state ---
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3f35" />
      </View>
    );
  }

  // --- Empty / not found ---
  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Δεν βρέθηκε η ανακοίνωση.</Text>
      </View>
    );
  }

  // --- Normalize content type ---
  const content: EditorJsContent =
    typeof post.content === 'string'
      ? JSON.parse(post.content)
      : post.content;

  const subPageName =
    typeof post.subPage === 'object' && post.subPage?.name
      ? post.subPage.name
      : '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.inner}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Date */}
      {post.createdAt && (
        <Text style={styles.date}>
          {new Date(post.createdAt).toLocaleString('el-GR')}
        </Text>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Content */}
      <RenderedEditorJsContent
        editorJsData={content}
        subPageName={subPageName}
      />
    </ScrollView>
  );
};

// --- styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf8',
  },
  inner: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d2d2d',
    textAlign: 'center',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
});

export default BlogPostScreen;

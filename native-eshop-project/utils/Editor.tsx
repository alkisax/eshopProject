// native-eshop-project/utils/PostViewer.tsx
/*
  📘 PostViewer (native)
  - Fetches one blog post by id from backend
  - Renders it using RenderedEditorJsContent (read-only)
  - No editing / no EditorJS initialization
*/

import React, { useEffect, useState, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import RenderedEditorJsContent from '../components/RenderedEditorJsContent';
import type { EditorJsContent, PostType } from '../types/blogTypes';
import { VariablesContext } from '../context/VariablesContext';

interface Props {
  id: string; // required for viewing a single post
}

const PostViewer = ({ id }: Props) => {
  const { url } = useContext(VariablesContext);
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${url}/api/posts/${id}`);
        const data = res.data?.data ?? res.data;
        setPost(data);
      } catch (error) {
        console.error('Failed to fetch post', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, url]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4a3f35" />
      </View>
    );
  }

  if (!post) return null;

  const subPageName =
    typeof post.subPage === 'object' && post.subPage?.name
      ? post.subPage.name
      : '';

  const content: EditorJsContent =
    typeof post.content === 'string'
      ? JSON.parse(post.content)
      : post.content;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <RenderedEditorJsContent
        editorJsData={content}
        subPageName={subPageName}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf8',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PostViewer;

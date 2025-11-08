// native-eshop-project/components/LastAnnouncement.tsx
import { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { VariablesContext } from '../context/VariablesContext';
import { getPreviewContent } from '../utils/editorHelper';
import type { EditorJsContent } from '../types/blogTypes';

/*
  7/11/2025
  📌 Native version of LastAnnouncement component.
  - Fetches all posts from backend.
  - Filters those whose subPage.name === "announcements".
  - Sorts by createdAt descending and keeps the first one.
  - Displays the title + a preview of content (first paragraph/image).
  - Respects the context-based url just like the web version.
*/

type Announcement = {
  _id: string;
  title: string;
  content: EditorJsContent;
  createdAt: string;
  slug?: string;
  subPage?: { _id: string; name: string } | string;
};

const LastAnnouncement = () => {
  const { url } = useContext(VariablesContext);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get<{ data: Announcement[] }>(`${url}/api/posts`);
        const all = res.data.data;

        // 🔎 Filter only announcements page posts
        const announcements = all.filter(
          (p) =>
            typeof p.subPage === 'object' &&
            p.subPage !== null &&
            'name' in p.subPage &&
            p.subPage.name === 'announcements'
        );

        // 🕒 Sort descending by date and keep latest
        const latest = announcements
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

        setAnnouncement(latest || null);
      } catch (err) {
        console.error('Error fetching announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [url]);

  if (loading) return <LastAnnouncementSkeleton />;

  if (!announcement) {
    return (
      <Text style={styles.noData}>Δεν υπάρχουν ανακοινώσεις ακόμη.</Text>
    );
  }

  // 🧠 Prepare preview content using same helper
  const previewContent = getPreviewContent(announcement.content, 50);

  // find first image or paragraph
  const firstImage = previewContent.blocks.find(
    (b) => b.type === 'image'
  ) as any;
  const firstParagraph = previewContent.blocks.find(
    (b) => b.type === 'paragraph'
  ) as any;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: '/posts/[id]',
          params: { id: announcement.slug || announcement._id },
        } as const)
      }
    >
      <ScrollView
        style={{ flexGrow: 0 }}
        nestedScrollEnabled
        scrollEnabled={false}
      >
        {firstImage?.data?.file?.url && (
          <Image
            source={{ uri: firstImage.data.file.url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.cardBody}>
          <Text style={styles.title}>{announcement.title}</Text>
          {firstParagraph?.data?.text && (
            <Text style={styles.preview}>
              {firstParagraph.data.text.replace(/<[^>]+>/g, '')}
            </Text>
          )}
          {typeof announcement.subPage === 'object' &&
            'name' in announcement.subPage && (
              <Text style={styles.subPage}>
                📄 Page: {announcement.subPage.name}
              </Text>
            )}
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
};

/* ✅ Skeleton shimmer */
const LastAnnouncementSkeleton = () => {
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
    <Animated.View style={[styles.card, { backgroundColor }]}>
      <View style={{ height: 180, borderRadius: 12, backgroundColor: '#e0e0e0' }} />
      <View style={{ padding: 16 }}>
        <View style={{ height: 20, width: '70%', backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 10 }} />
        <View style={{ height: 14, width: '90%', backgroundColor: '#e0e0e0', borderRadius: 4 }} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 20,
    overflow: 'hidden',
  },
  cardBody: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  subPage: {
    fontSize: 12,
    color: 'gray',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noData: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 20,
  },
});

export default LastAnnouncement;

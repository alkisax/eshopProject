import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { VariablesContext } from '@/context/VariablesContext';
import { AiModerationContext } from '@/context/AiModerationContext';
import type { CommentType, CommodityType } from '@/types/commerce.types';
import { Rating } from 'react-native-ratings';

interface Props {
  commodityId: string;
}

/*
  📋 CommodityReviews
  - Fetches comments for one commodity
  - Displays average rating
  - Allows user to add a comment (logged user simulation)
  - Handles pagination (3 per page)
*/

const COMMENTS_PER_PAGE = 3;

const CommodityReviews = ({ commodityId }: Props) => {
  const { url } = useContext(VariablesContext);
  const { aiModerationEnabled } = useContext(AiModerationContext);

  const [commodity, setCommodity] = useState<CommodityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentPage, setCommentPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState<number | null>(null);

  const fetchCommodity = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/commodity/${commodityId}`);
      setCommodity(res.data.data);
    } catch (err) {
      console.error('❌ Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [commodityId, url]);

  useEffect(() => {
    fetchCommodity();
  }, [fetchCommodity]);

  const comments = (commodity?.comments ?? []).filter((c) => c.isApproved);
  const totalComments = comments.length;
  const paginated = comments.slice(
    (commentPage - 1) * COMMENTS_PER_PAGE,
    commentPage * COMMENTS_PER_PAGE
  );

  const ratings = comments
    .map((c) => c.rating)
    .filter((r) => typeof r === 'number') as number[];

  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
      : null;

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('⚠️', 'Γράψτε ένα σχόλιο πριν το υποβάλετε.');
      return;
    }

    try {
      let approvedFlag = true;

      if (aiModerationEnabled) {
        const modRes = await axios.post(`${url}/api/moderationAi`, {
          commentToCheck: newComment,
        });

        if (modRes.data.data === false) approvedFlag = false;
      }

      // Temporary: simulate logged user
      const mockUserId = 'guest-native';

      await axios.post(`${url}/api/commodity/${commodityId}/comments`, {
        user: mockUserId,
        text: newComment,
        rating: newRating,
        isApproved: approvedFlag,
      });

      Alert.alert('✅', 'Το σχόλιό σας καταχωρήθηκε!');
      setNewComment('');
      setNewRating(null);
      setCommentPage(1);
      fetchCommodity();
    } catch (err) {
      console.error('Failed to post comment:', err);
      Alert.alert('❌', 'Αποτυχία υποβολής σχολίου.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3f35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Κριτικές Χρηστών</Text>

      {averageRating && (
        <Text style={styles.average}>⭐ Μέση αξιολόγηση: {averageRating}/5</Text>
      )}

      {/* New comment */}
      <TextInput
        style={styles.input}
        placeholder="Γράψτε μια κριτική..."
        value={newComment}
        onChangeText={setNewComment}
        multiline
      />

      {/* rating input  */}
      <View
        style={{
          alignItems: 'center',
          marginBottom: 12,
          backgroundColor: '#fffdf7',
        }}
      >
        <Rating
          type="star"
          ratingCount={5}
          startingValue={newRating || 0}
          imageSize={32}
          onFinishRating={(val: number) => setNewRating(val)}
          tintColor="#e0e0e0ff"
          ratingBackgroundColor="#bbbbbbff" // lighter gray for empty stars
          readonly={false}
        />
        <Text style={styles.ratingHint}>
          {newRating ? `⭐ ${newRating}/5` : 'Επιλέξτε αξιολόγηση'}
        </Text>
      </View>

      {/* Comments */}
      {paginated.length > 0 ? (
        <FlatList<CommentType>
          data={paginated}
          keyExtractor={(item, index) => item._id || String(index)}
          renderItem={({ item }) => (
            <View style={styles.commentCard}>
              <Text style={styles.commentUser}>
                👤 {getCommentUserLabel(item.user)}
              </Text>
              <Text style={styles.commentText}>
                {typeof item.text === 'string'
                  ? item.text
                  : '💬 (Σχόλιο με μορφοποιημένο περιεχόμενο)'}
              </Text>
              {typeof item.rating === 'number' && (
                <Text style={styles.commentRating}>⭐ {item.rating}/5</Text>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.empty}>Δεν υπάρχουν κριτικές ακόμη.</Text>
      )}

      {/* Pagination */}
      {totalComments > COMMENTS_PER_PAGE && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setCommentPage((p) => Math.max(1, p - 1))}
            style={[
              styles.pageButton,
              commentPage === 1 && styles.pageButtonDisabled,
            ]}
            disabled={commentPage === 1}
          >
            <Text style={styles.pageText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.pageLabel}>
            {commentPage} από {Math.ceil(totalComments / COMMENTS_PER_PAGE)}
          </Text>

          <TouchableOpacity
            onPress={() =>
              setCommentPage((p) =>
                Math.min(Math.ceil(totalComments / COMMENTS_PER_PAGE), p + 1)
              )
            }
            style={[
              styles.pageButton,
              commentPage >= Math.ceil(totalComments / COMMENTS_PER_PAGE) &&
                styles.pageButtonDisabled,
            ]}
            disabled={
              commentPage >= Math.ceil(totalComments / COMMENTS_PER_PAGE)
            }
          >
            <Text style={styles.pageText}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// helper
function getCommentUserLabel(u: any): string {
  if (!u) return 'Anonymous';
  if (typeof u === 'string') return u;
  if (typeof u === 'object' && 'username' in u && u.username)
    return u.username;
  return 'Anonymous';
}

const styles = StyleSheet.create({
  container: { marginTop: 24, paddingBottom: 32 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  average: {
    fontSize: 15,
    color: '#48C4CF',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#48C4CF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { backgroundColor: '#BFDDE0' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  commentCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  commentUser: { fontWeight: '600', marginBottom: 4 },
  commentText: { color: '#444' },
  commentRating: { color: '#777', marginTop: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 8 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  pageButton: {
    backgroundColor: '#48C4CF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pageButtonDisabled: { backgroundColor: '#BFDDE0' },
  pageText: { color: '#fff', fontWeight: 'bold' },
  pageLabel: { fontWeight: '600', color: '#48C4CF' },
  center: { alignItems: 'center', justifyContent: 'center' },
  ratingHint: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default CommodityReviews;

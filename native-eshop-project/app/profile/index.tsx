// native-eshop-project\app\profile\index.tsx
import React, { useContext, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import axios from 'axios'
import { getToken } from '@/utils/storage'
import { UserAuthContext } from '@/context/UserAuthContext'
import { VariablesContext } from '@/context/VariablesContext'
import type { CommentType } from '@/types/commerce.types'

const ProfileScreen = () => {
  const { user, isLoading } = useContext(UserAuthContext)
  const { url } = useContext(VariablesContext)
  const [comments, setComments] = useState<CommentType[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  // === Fetch user comments ===
  const handleFetchComments = async () => {
    if (!user?._id) return
    setLoadingComments(true)

    const token = await getToken()
    if (!token) {
      Alert.alert('Σφάλμα', 'Δεν βρέθηκε token')
      return
    }

    try {
      const res = await axios.get(`${url}/api/commodity/comments/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.status) {
        setComments(res.data.data)
      } else {
        Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης σχολίων')
      }
    } catch (err) {
      console.error('❌ Failed to fetch comments', err)
      Alert.alert('Σφάλμα', 'Πρόβλημα κατά τη φόρτωση σχολίων')
    } finally {
      setLoadingComments(false)
    }
  }

  // === UI states ===
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3f35" />
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Πρέπει να συνδεθείτε για να δείτε το προφίλ σας.</Text>
      </View>
    )
  }

  // === Render user info ===
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Προφίλ Χρήστη</Text>

      <View style={styles.card}>
        <Text style={styles.label}>🆔 ID</Text>
        <Text style={styles.value}>{user._id}</Text>

        <Text style={styles.label}>👤 Όνομα</Text>
        <Text style={styles.value}>{user.name || '—'}</Text>

        <Text style={styles.label}>📧 Email</Text>
        <Text style={styles.value}>{user.email || '—'}</Text>

        <Text style={styles.label}>👥 Username</Text>
        <Text style={styles.value}>{user.username || '—'}</Text>

        <Text style={styles.label}>🔑 Provider</Text>
        <Text style={styles.value}>{user.provider || 'backend'}</Text>

        <Text style={styles.label}>🔒 Έχει κωδικό</Text>
        <Text style={styles.value}>{user.hasPassword ? 'Ναι' : 'Όχι'}</Text>
      </View>

      {/* === Comments === */}
      <TouchableOpacity
        onPress={handleFetchComments}
        style={styles.commentBtn}
        disabled={loadingComments}
      >
        <Text style={styles.commentBtnText}>
          {loadingComments ? 'Φόρτωση σχολίων...' : 'Δείτε τα σχόλιά μου'}
        </Text>
      </TouchableOpacity>

      {comments.length > 0 && (
        <View style={styles.commentsBox}>
          <Text style={styles.commentsTitle}>Τα σχόλιά μου</Text>
          {comments.map((c, idx) => (
            <View key={idx} style={styles.commentCard}>
              <Text style={styles.commentText}>
                💬 {typeof c.text === 'string' ? c.text : JSON.stringify(c.text)}
              </Text>
              <Text style={styles.commentMeta}>
                🏷️ {c.commodityName ?? c.commodityId ?? 'Άγνωστο προϊόν'}
              </Text>
              <Text style={styles.commentMeta}>⭐ Βαθμολογία: {c.rating ?? '—'}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fffdf7',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffdf7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a3f35',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#777',
    marginTop: 6,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  commentBtn: {
    backgroundColor: '#48C4CF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  commentBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commentsBox: {
    width: '100%',
    backgroundColor: '#f7f9fb',
    borderRadius: 10,
    padding: 12,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a3f35',
    marginBottom: 8,
  },
  commentCard: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  commentText: {
    fontSize: 15,
    color: '#333',
  },
  commentMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  text: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 24,
  },
})

export default ProfileScreen

import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native'
import axios from 'axios'
import { VariablesContext } from '@/context/VariablesContext'
import type { TransactionType } from '@/types/commerce.types'

const CheckoutSuccess = () => {
  const { url, globalParticipant, setGlobalParticipant } = useContext(VariablesContext)
  const [transactions, setTransactions] = useState<TransactionType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // if participant missing, try restoring guest
        if (!globalParticipant?._id) {
          const storedId = localStorage.getItem('guestParticipantId')
          if (storedId) {
            const res = await axios.get(`${url}/api/participant/${storedId}`)
            setGlobalParticipant(res.data.data)
          }
          return
        }

        const token = localStorage.getItem('token')
        const res = await axios.get<{ status: boolean; data: TransactionType[] }>(
          `${url}/api/transaction/participant/${globalParticipant._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const sorted = res.data.data.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        )

        setTransactions(sorted)
      } catch (err) {
        console.error('Error fetching transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [globalParticipant?._id, setGlobalParticipant, url])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#48C4CF" />
      </View>
    )
  }

  if (!globalParticipant?._id) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>❌ Δεν βρέθηκαν στοιχεία συμμετέχοντα.</Text>
      </View>
    )
  }

  const lastTransaction = transactions[0]

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>✅ Ευχαριστούμε, {globalParticipant.name || 'επισκέπτη'}!</Text>
      <Text style={styles.subtitle}>Η πληρωμή σας ολοκληρώθηκε με επιτυχία 🎉</Text>

      {lastTransaction ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🛍️ Τελευταία αγορά</Text>
          <Text style={styles.date}>
            {new Date(lastTransaction.createdAt!).toLocaleString('el-GR')}
          </Text>

          {lastTransaction.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              {item.commodity.images?.[0] && (
                <Image
                  source={{ uri: item.commodity.images[0] }}
                  style={styles.itemImage}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {item.commodity.name} × {item.quantity}
                </Text>
                <Text style={styles.itemPrice}>
                  {item.priceAtPurchase}€ / τεμ.
                </Text>
              </View>
            </View>
          ))}

          <Text style={styles.totalText}>
            Σύνολο: {lastTransaction.amount.toFixed(2)}€
          </Text>

          <Text style={styles.emailNotice}>
            📧 Θα λάβετε σύντομα επιβεβαίωση μέσω email.
          </Text>
        </View>
      ) : (
        <Text style={styles.info}>Δεν υπάρχουν συναλλαγές ακόμη.</Text>
      )}

      {transactions.length > 1 && (
        <View style={styles.previousSection}>
          <TouchableOpacity onPress={() => setShowAll(!showAll)} activeOpacity={0.8}>
            <Text style={styles.toggleText}>
              {showAll ? 'Απόκρυψη προηγούμενων' : '📜 Προηγούμενες αγορές'}
            </Text>
          </TouchableOpacity>

          {showAll &&
            transactions.slice(1).map((t) => (
              <View key={t._id?.toString()} style={styles.oldCard}>
                <Text style={styles.oldDate}>
                  {new Date(t.createdAt!).toLocaleString('el-GR')}
                </Text>
                {t.items.map((item, i) => (
                  <Text key={i} style={styles.oldItem}>
                    {item.commodity.name} × {item.quantity} — {item.priceAtPurchase}€
                  </Text>
                ))}
                <Text style={styles.oldTotal}>Σύνολο: {t.amount}€</Text>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffdf7' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffdf7',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2d2d2d',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 10,
  },
  itemName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 13,
    color: '#777',
  },
  totalText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    color: '#4a3f35',
  },
  emailNotice: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#2d7a2d',
    fontWeight: '500',
  },
  info: { textAlign: 'center', color: '#555', fontSize: 15, marginTop: 20 },
  previousSection: { marginTop: 24 },
  toggleText: {
    textAlign: 'center',
    color: '#48C4CF',
    fontWeight: '600',
    fontSize: 15,
  },
  oldCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  oldDate: { fontSize: 13, color: '#777', marginBottom: 4 },
  oldItem: { fontSize: 14, color: '#333' },
  oldTotal: { fontSize: 14, fontWeight: '700', marginTop: 4, textAlign: 'right' },
  error: { fontSize: 16, color: '#a33' },
})

export default CheckoutSuccess

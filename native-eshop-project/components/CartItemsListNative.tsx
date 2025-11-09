// native-eshop-project\components\CartItemsListNative.tsx
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

import { CartActionsContext } from '@/context/CartActionsContext';
import { VariablesContext } from '@/context/VariablesContext';
import { UserAuthContext } from '@/context/UserAuthContext';
import type { CartType } from '@/types/commerce.types';

const CartItemsListNative = () => {
  const { addOneToCart, addQuantityCommodityToCart, removeItemFromCart, fetchParticipantId } =
    useContext(CartActionsContext);
  const { url, globalParticipant } = useContext(VariablesContext);
  const { isLoading, setIsLoading } = useContext(UserAuthContext);
  const [cart, setCart] = useState<CartType | null>(null);

  const router = useRouter();

  const fetchCart = useCallback(async () => {
    if (!globalParticipant?._id) return;

    try {
      setIsLoading(true);
      const res = await axios.get<{ status: boolean; data: CartType }>(
        `${url}/api/cart/${globalParticipant._id}`
      );
      const cartRes = res.data.data;
      setCart(cartRes);
      console.log('fetched cart:', cartRes);
    } catch (err) {
      console.log('error fetching cart', err);
    } finally {
      setIsLoading(false);
    }
  }, [url, globalParticipant?._id, setIsLoading]);

  useEffect(() => {
    if (globalParticipant?._id) {
      fetchCart();
    }
  }, [fetchCart, globalParticipant?._id]);

  const add = async (id: string) => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await addOneToCart(id);
    await fetchCart();
  };

  const decrement = async (id: string) => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await addQuantityCommodityToCart(participantId, id, -1);
    await fetchCart();
  };

  const remove = async (id: string) => {
    const participantId = await fetchParticipantId();
    if (!participantId) return;
    await removeItemFromCart(participantId, id);
    await fetchCart();
  };

  const total =
    cart?.items?.reduce(
      (sum, item) => sum + item.commodity.price * item.quantity,
      0
    ) ?? 0;
  const currency = cart?.items[0]?.commodity.currency ?? '';

  if (isLoading && !cart) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3f35" />
      </View>
    );
  }

  if (!cart) {
    return <Text style={styles.infoText}>Δεν βρέθηκε καλάθι.</Text>;
  }

  if (cart.items.length === 0) {
    return <Text style={styles.infoText}>Το καλάθι σας είναι άδειο.</Text>;
  }

  return (
    <View>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.commodity._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <TouchableOpacity
              style={styles.itemLeft}
              activeOpacity={0.8}
              onPress={() =>
                router.push(`/commodity/${item.commodity._id}`)
              }
            >
              <Image
                source={{
                  uri:
                    item.commodity.images?.[0] ||
                    'https://via.placeholder.com/80',
                }}
                style={styles.image}
              />
              <View style={styles.itemTextBox}>
                <Text style={styles.itemTitle}>{item.commodity.name}</Text>
                <Text style={styles.itemSubtitle}>
                  {item.commodity.price} {item.commodity.currency} — Qty:{' '}
                  {item.quantity}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.plusBtn]}
                onPress={() => add(item.commodity._id)}
              >
                <Text style={styles.actionText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.minusBtn]}
                onPress={() => decrement(item.commodity._id)}
              >
                <Text style={styles.actionText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => remove(item.commodity._id)}
              >
                <Text style={styles.actionText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.totalText}>
        Σύνολο: {total.toFixed(2)} {currency}
      </Text>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.bottomBtn, styles.primaryBtn]}
          onPress={() => router.push('/shipping-info')}
        >
          <Text style={styles.bottomBtnText}>Συνέχεια στην αποστολή</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, styles.outlineBtn]}
          onPress={() => router.push('/store')}
        >
          <Text style={styles.outlineBtnText}>Συνέχεια αγορών</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    marginTop: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemTextBox: {
    flexShrink: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#777',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  plusBtn: { backgroundColor: '#48C4CF' },
  minusBtn: { backgroundColor: '#48C4CF' },
  deleteBtn: { backgroundColor: '#FF6B6B' },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    color: '#4a3f35',
  },
  bottomButtons: {
    marginTop: 20,
    gap: 10,
  },
  bottomBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#48C4CF',
  },
  bottomBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#48C4CF',
    backgroundColor: '#fff',
  },
  outlineBtnText: {
    color: '#48C4CF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default CartItemsListNative;

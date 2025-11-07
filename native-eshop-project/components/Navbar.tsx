// native-eshop-project\components\Navbar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, Badge, IconButton } from 'react-native-paper';

 const Navbar = () => {
  const router = useRouter();

  // TODO: later, get from context or Appwrite state
  const cartCount = 2;
  const hasFavorites = true;
  const user = null; // placeholder until login system integrated

  return (
    <Appbar.Header style={styles.header}>
      {/* Logo + Title */}
      <TouchableOpacity
        onPress={() => router.push('/')}
        style={styles.logoContainer}
        activeOpacity={0.7}
      >
        <Image
          source={require('../assets/images/banner-idea.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Έχω μια Ιδέα</Text>
      </TouchableOpacity>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Store */}
      <IconButton
        icon="storefront-outline"
        size={26}
        onPress={() => router.push('/store')}
      />

      {/* Cart */}
      <View>
        <IconButton
          icon="cart-outline"
          size={26}
          onPress={() => router.push('/cart')}
        />
        {cartCount > 0 && (
          <Badge style={styles.badge}>{cartCount}</Badge>
        )}
      </View>

      {/* Favorites */}
      {hasFavorites && (
        <IconButton
          icon="heart-outline"
          size={26}
          onPress={() => router.push('/favorites')}
        />
      )}

      {/* Profile or Login */}
      {user ? (
        <IconButton
          icon="account-circle-outline"
          size={26}
          onPress={() => router.push('/profile')}
        />
      ) : (
        <IconButton
          icon="login"
          size={26}
          onPress={() => router.push('/login')}
        />
      )}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fffdf7',
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4a3f35',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FFD500',
    color: '#4a3f35',
  },
});

export default Navbar

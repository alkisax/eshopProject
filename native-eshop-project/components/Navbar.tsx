// native-eshop-project/components/Navbar.tsx
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, Badge, IconButton } from 'react-native-paper';
import { UserAuthContext } from '@/context/UserAuthContext';
import { CartActionsContext } from '@/context/CartActionsContext';
import { VariablesContext } from '@/context/VariablesContext'; 

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useContext(UserAuthContext);
  const { cartCount } = useContext(CartActionsContext); 
  const { hasCart } = useContext(VariablesContext); 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hasFavorites, setHasFavorites  } = useContext(VariablesContext);

  const handleLogout = async () => {
    console.log('🧹 Logging out...');
    await logout();
    router.replace('/login');
  };

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

      <View style={{ flex: 1 }} />

      {/* Store */}
      <IconButton icon="storefront-outline" size={26} onPress={() => router.push('/store')} />

      {/* Cart */}
      <View>
        <IconButton
          icon="cart-outline"
          size={26}
          onPress={() => router.push('/cart')}
        />
        {hasCart && cartCount > 0 && (
          <Badge style={styles.badge}>{cartCount}</Badge>
        )}
      </View>

      {/* Favorites */}
      {hasFavorites && (
        <IconButton icon="heart-outline" size={26} onPress={() => router.push('/favorites')} />
      )}

      {/* Profile / Login */}
      {user ? (
        <>
          <IconButton
            icon="logout"
            size={26}
            onPress={() => {
              console.log('log out pressed');
              handleLogout();
            }}
          />
          <IconButton icon="account-circle-outline" size={26} onPress={() => router.push('/profile')} />
        </>
      ) : (
        <IconButton icon="login" size={26} onPress={() => router.push('/login')} />
      )}
    </Appbar.Header>
  );
};

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

export default Navbar;

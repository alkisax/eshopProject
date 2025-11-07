// native-eshop-project/components/Footer.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';

const Footer = () => {
  const router = useRouter();

  const handleTel = () => {
    Linking.openURL('tel:+302100000000');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@example.com');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.columnsContainer}>
        {/* Logo column */}
        <View style={styles.column}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/images/banner-idea.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Πληροφορίες */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Πληροφορίες</Text>
          <TouchableOpacity onPress={() => router.push('/payment-methods')}>
            <Text style={styles.linkText}>Τρόποι Πληρωμής</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/shipping-methods')}>
            <Text style={styles.linkText}>Τρόποι Αποστολής</Text>
          </TouchableOpacity>
          {/* Συχνές Ερωτήσεις → placeholder for now */}
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.linkText}>Συχνές Ερωτήσεις</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text style={styles.linkText}>Όροι Χρήσης</Text>
          </TouchableOpacity>
        </View>

        {/* Εταιρεία */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Εταιρεία</Text>
          <TouchableOpacity onPress={() => router.push('/contact')}>
            <Text style={styles.linkText}>Επικοινωνία</Text>
          </TouchableOpacity>
        </View>

        {/* Πολιτικές */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Πολιτικές</Text>
          <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
            <Text style={styles.linkText}>Πολιτική Απορρήτου</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/return-policy')}>
            <Text style={styles.linkText}>Πολιτική Επιστροφών</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cookie-policy')}>
            <Text style={styles.linkText}>Πολιτική Cookies</Text>
          </TouchableOpacity>
        </View>

        {/* Social */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Ακολουθήστε μας</Text>
          <View style={styles.socialRow}>
            <IconButton
              icon="facebook"
              size={22}
              onPress={() => {}}
            />
            <IconButton
              icon="instagram"
              size={22}
              onPress={() => {}}
            />
            <IconButton
              icon="email-outline"
              size={22}
              onPress={handleEmail}
            />
            <IconButton
              icon="phone"
              size={22}
              onPress={handleTel}
            />
          </View>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>
          © {new Date().getFullYear()} Έχω μια Ιδέα... | Χειροποίητο Κόσμημα.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f2efe9', // earthy beige
  },
  columnsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  column: {
    minWidth: '45%',
    marginBottom: 16,
  },
  logoWrapper: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    height: 80,
    width: 120,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a3f35', // dark earthy brown
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#4a3f35',
    marginBottom: 4,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBar: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#d6d2c4',
    paddingTop: 8,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
});

export default Footer;

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Footer from '../../../components/Footer';

const PaymentMethods = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Μέθοδοι Πληρωμής</Text>

        <Text style={styles.text}>
          Στο ηλεκτρονικό μας κατάστημα μπορείτε να επιλέξετε τον τρόπο πληρωμής που σας
          εξυπηρετεί περισσότερο. Όλες οι πληρωμές διεκπεραιώνονται μέσω της ασφαλούς
          εφαρμογής της <Text style={styles.bold}>Stripe</Text>, η οποία εγγυάται την
          ασφάλεια των συναλλαγών σας.
        </Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>1. Πληρωμή με Κάρτα Online</Text>
          <Text style={styles.text}>
            Μπορείτε να πληρώσετε online με απόλυτη ασφάλεια χρησιμοποιώντας την κάρτα σας.
            Δεχόμαστε όλες τις κύριες κάρτες, όπως{' '}
            <Text style={styles.bold}>Visa, Mastercard, Maestro και American Express</Text>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>2. Εναλλακτικοί Τρόποι Πληρωμής</Text>

          <View style={styles.listItem}>
            <Text style={styles.text}>
              <Text style={styles.bold}>Google Pay:</Text> Πληρωμή απευθείας από την εφαρμογή σας.
            </Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.text}>
              <Text style={styles.bold}>Revolut Pay:</Text> Εύκολες και γρήγορες συναλλαγές με τον
              Revolut λογαριασμό σας.
            </Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.text}>
              <Text style={styles.bold}>PayPal:</Text> Πληρώστε με ασφάλεια μέσω του PayPal λογαριασμού σας.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Σημείωση</Text>
          <Text style={styles.text}>
            Η παραγγελία σας αποστέλλεται μόλις ολοκληρωθεί επιτυχώς η πληρωμή μέσω της Stripe.
            Όλες οι συναλλαγές είναι κρυπτογραφημένες και συμμορφώνονται με τα υψηλότερα διεθνή
            πρότυπα ασφαλείας.
          </Text>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.note}>
            Επιλέξτε τον τρόπο πληρωμής που σας εξυπηρετεί και ολοκληρώστε την αγορά σας
            με ασφάλεια και ευκολία!
          </Text>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f7f2',
  },
  inner: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a3f35',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a3f35',
    marginBottom: 6,
  },
  section: {
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  listItem: {
    marginLeft: 12,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  noteBox: {
    marginTop: 30,
    alignItems: 'center',
  },
  note: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PaymentMethods;

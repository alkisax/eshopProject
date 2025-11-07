// app/return-policy/index.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Footer from '../../../components/Footer';

const ReturnPolicy = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Πολιτική Επιστροφών</Text>

      <Text style={styles.text}>
        Έχετε το δικαίωμα να επιστρέψετε προϊόντα εντός{' '}
        <Text style={styles.bold}>14 ημερολογιακών ημερών</Text> από την παραλαβή τους,
        μαζί με την πλήρη συσκευασία και τα απαραίτητα έγγραφα (π.χ. απόδειξη αγοράς,
        εγγύηση).
      </Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Εξαιρέσεις</Text>
        <Text style={styles.text}>
          Δεν επιστρέφονται προϊόντα που κατασκευάζονται κατόπιν ειδικής παραγγελίας
          (π.χ. βέρες, δαχτυλίδια με ειδικές τροποποιήσεις, σκουλαρίκια για λόγους
          υγιεινής).
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Προϋποθέσεις Επιστροφής</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>
            • Τα προϊόντα πρέπει να βρίσκονται στην αρχική τους κατάσταση, χωρίς χρήση,
            μόνο για δοκιμή.
          </Text>
          <Text style={styles.listItem}>
            • Πρέπει να είναι σωστά συσκευασμένα ώστε να μην υποστούν φθορές κατά τη
            μεταφορά.
          </Text>
          <Text style={styles.listItem}>
            • Ο πελάτης φέρει την ευθύνη για την επιλογή σωστού μεγέθους (π.χ.
            δαχτυλιδιών).
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Διαδικασία Επιστροφής</Text>
        <Text style={styles.text}>
          Συστήνεται να επικοινωνήσετε πρώτα με το Τμήμα Εξυπηρέτησης Πελατών. Εφόσον η
          επιστροφή γίνει δεκτή, το ποσό αγοράς (μείον τα μεταφορικά) επιστρέφεται στον
          λογαριασμό σας.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Έξοδα</Text>
        <Text style={styles.text}>
          Αν είστε καταναλωτής και η επιστροφή πληροί τις προϋποθέσεις, τα έξοδα μπορεί
          να καλυφθούν από την εταιρεία. Σε άλλες περιπτώσεις, τα έξοδα επιστροφής
          επιβαρύνουν τον πελάτη.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Τρόποι Επιστροφής Χρημάτων</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>
            • <Text style={styles.bold}>PayPal:</Text> Επιστροφή στο λογαριασμό PayPal.
          </Text>
          <Text style={styles.listItem}>
            • <Text style={styles.bold}>Πιστωτική/Χρεωστική Κάρτα:</Text> Ακύρωση χρέωσης
            & επιστροφή στο λογαριασμό της κάρτας.
          </Text>
          <Text style={styles.listItem}>
            • <Text style={styles.bold}>Τραπεζική Κατάθεση:</Text> Απαραίτητο το IBAN &
            στοιχεία δικαιούχου. Πίστωση εντός 5 εργάσιμων ημερών.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Ακύρωση Παραγγελίας</Text>
        <Text style={styles.text}>
          Έχετε δικαίωμα ακύρωσης της παραγγελίας εντός{' '}
          <Text style={styles.bold}>24 ωρών</Text> από την επιβεβαίωση, με e-mail στο{' '}
          <Text style={styles.bold}>info@*****.gr</Text>.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Ενημέρωση</Text>
        <Text style={styles.text}>
          Η τρέχουσα Πολιτική Επιστροφών αναρτήθηκε την{' '}
          <Text style={styles.bold}>02/11/2023</Text>. Η εταιρεία διατηρεί το δικαίωμα
          τροποποίησης χωρίς προειδοποίηση.
        </Text>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#4a3f35',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4a3f35',
  },
  section: {
    marginTop: 16,
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  list: {
    marginTop: 4,
  },
  listItem: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default ReturnPolicy;

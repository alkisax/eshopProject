import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Footer from '../../../components/Footer';

const ShippingMethods = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <Text style={styles.title}>Μέθοδοι Αποστολής</Text>

      <Text style={styles.paragraph}>
        Αποστολές εντός & εκτός Αττικής.
      </Text>

      {/* Χρεώσεις */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Χρεώσεις Αποστολής (Εντός Ελλάδος)</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• Με Γενική Ταχυδρομική: 3.00€</Text>
          <Text style={styles.listItem}>• Με Box Now: 1.50€</Text>
        </View>
      </View>

      {/* Χρόνος Παράδοσης */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Χρόνος Παράδοσης</Text>
        <Text style={styles.paragraph}>
          Οι αποστολές προϊόντων γίνονται εντός και εκτός Ελλάδος σύμφωνα με τους
          όρους και προϋποθέσεις της εφαρμοστέας νομοθεσίας. Αν το προϊόν είναι
          διαθέσιμο, καταβάλλουμε κάθε δυνατή προσπάθεια ώστε οι αποστολές να
          εκτελούνται εντός <Text style={styles.bold}>48-92 ωρών</Text>. Σε κάθε περίπτωση, η
          εταιρεία οφείλει να εκπληρώσει την παραγγελία εντός 30 ημερών.
        </Text>
      </View>

      {/* Πιθανοί Λόγοι Καθυστέρησης */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Πιθανοί Λόγοι Καθυστέρησης</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>
            • (α) Καθυστέρηση από τον προμηθευτή, τελωνείο ή μεταφορά.
          </Text>
          <Text style={styles.listItem}>
            • (β) Το προϊόν έχει καταργηθεί και δεν είναι διαθέσιμο.
          </Text>
          <Text style={styles.listItem}>
            • (γ) Ακραία καιρικά φαινόμενα, απεργίες ή ανωτέρα βία.
          </Text>
          <Text style={styles.listItem}>
            • (δ) Αδυναμία επικοινωνίας λόγω λανθασμένων ή μη ενημερωμένων στοιχείων.
          </Text>
        </View>
      </View>

      {/* Μη Διαθεσιμότητα */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Μη Διαθεσιμότητα</Text>
        <Text style={styles.paragraph}>
          Αν λείπει μέρος της παραγγελίας, το υπόλοιπο εκτελείται κανονικά, εκτός αν
          δηλώσετε ότι η μερική εκτέλεση δεν εξυπηρετεί τις ανάγκες σας, οπότε η
          παραγγελία ακυρώνεται.
        </Text>
      </View>

      {/* Ασφάλεια Συσκευασίας */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Ασφάλεια Συσκευασίας</Text>
        <Text style={styles.paragraph}>
          Όλες οι παραγγελίες αποστέλλονται σφραγισμένες. Εάν παραλάβετε ανοιχτό ή
          κατεστραμμένο πακέτο, μην το αποδεχτείτε και επικοινωνήστε άμεσα μαζί μας
          στο <Text style={styles.bold}>info@*****.gr</Text>.
        </Text>
      </View>

      {/* Ώρες Παράδοσης */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Ώρες Παράδοσης</Text>
        <Text style={styles.paragraph}>
          Οι παραδόσεις γίνονται με courier καθημερινά 09:00 – 17:00. Αν θέλετε
          συγκεκριμένη ώρα, σημειώστε το στα σχόλια της παραγγελίας σας (χωρίς
          δέσμευση από την courier).
        </Text>
      </View>

      {/* Ενδεικτικοί Χρόνοι Παράδοσης */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Ενδεικτικοί Χρόνοι Παράδοσης</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>
            • Χερσαίοι Προορισμοί: 1-2 εργάσιμες ημέρες
          </Text>
          <Text style={styles.listItem}>
            • Νησιωτικοί Προορισμοί: 1-3 εργάσιμες ημέρες
          </Text>
          <Text style={styles.listItem}>
            • Δυσπρόσιτες Περιοχές: 1-4 εργάσιμες ημέρες
          </Text>
        </View>
      </View>

      {/* Κύπρος */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Κύπρος</Text>
        <Text style={styles.paragraph}>
          Τα προϊόντα αποστέλλονται με Γενική Ταχυδρομική. Χρόνος παράδοσης{' '}
          <Text style={styles.bold}>5-7 εργάσιμες ημέρες</Text>. Κόστος αποστολής{' '}
          <Text style={styles.bold}>10€</Text>.
        </Text>
      </View>
      <Footer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf9',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4a3f35',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a3f35',
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 4,
  },
  list: {
    marginTop: 4,
    marginLeft: 8,
  },
  listItem: {
    fontSize: 15,
    color: '#444',
    marginBottom: 3,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default ShippingMethods;

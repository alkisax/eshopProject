// native-eshop-project/app/cookie-policy/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import Footer from '../../../components/Footer';

const CookiePolicy = () => {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Πολιτική Cookies</Text>

      <Text style={styles.text}>
        Όπως τα περισσότερα sites, έτσι κι εμείς χρησιμοποιούμε cookies ώστε να έχουμε πρόσβαση σε
        ορισμένες πληροφορίες και να σας προσφέρουμε λειτουργικές υπηρεσίες κάθε φορά που
        περιηγείστε στο ηλεκτρονικό μας κατάστημα.
      </Text>

      <Text style={styles.text}>
        Τα cookies είναι μικρά αλφαριθμητικά αρχεία που αποθηκεύονται στη συσκευή σας μέσω του
        browser. Δεν προκαλούν βλάβες στη συσκευή ή στα αρχεία σας και τα περισσότερα διαγράφονται
        όταν αποχωρείτε από τη σελίδα μας.
      </Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Τύποι Cookies</Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>Απολύτως Απαραίτητα:</Text> Απαραίτητα για τη σωστή λειτουργία
          του site. Δεν αναγνωρίζουν την ταυτότητά σας.
        </Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>Cookies Λειτουργικότητας:</Text> Θυμούνται τις επιλογές σας
          (π.χ. στοιχεία σύνδεσης) και παρέχουν προσωποποιημένες λειτουργίες.
        </Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>Cookies Επιδόσεων / Analytics:</Text> Συλλέγουν ανώνυμες
          πληροφορίες για τον τρόπο χρήσης του site (σελίδες που βλέπετε συχνότερα, σφάλματα κ.λπ.),
          ώστε να βελτιώνουμε τις υπηρεσίες μας.
        </Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>Cookies Στόχευσης / Διαφήμισης:</Text> Χρησιμοποιούνται για
          εξατομικευμένο περιεχόμενο και στοχευμένες διαφημίσεις.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Διαχείριση Cookies</Text>
        <Text style={styles.text}>Μέσα από τις ρυθμίσεις του browser σας μπορείτε να:</Text>
        <Text style={styles.listItem}>• Εμποδίσετε την εγκατάσταση νέων cookies.</Text>
        <Text style={styles.listItem}>• Ενεργοποιήσετε ειδοποίηση πριν την αποθήκευση cookie.</Text>
        <Text style={styles.listItem}>• Διαγράψετε τα ήδη αποθηκευμένα cookies στη συσκευή σας.</Text>

        <Text style={[styles.text, { marginTop: 10 }]}>
          Για περισσότερες πληροφορίες για το πώς να διαχειριστείτε τα cookies στο browser, παρακαλώ
          ανατρέξτε στα ακόλουθα link (οι διευθύνσεις και το περιεχόμενό τους ενδέχεται να
          τροποποιούνται):
        </Text>

        <View style={styles.links}>
          <TouchableOpacity onPress={() => openLink('https://support.mozilla.org/el/kb/energopoihsh-apenergopoihsh-cookies-parakoloy8hsh-protimhsewn')}>
            <Text style={styles.link}>Firefox</Text>
          </TouchableOpacity>
          <Text> | </Text>
          <TouchableOpacity onPress={() => openLink('https://support.google.com/chrome/answer/95647')}>
            <Text style={styles.link}>Chrome</Text>
          </TouchableOpacity>
          <Text> | </Text>
          <TouchableOpacity onPress={() => openLink('https://support.apple.com/kb/ph19214?locale=el_GR')}>
            <Text style={styles.link}>Safari</Text>
          </TouchableOpacity>
          <Text> | </Text>
          <TouchableOpacity onPress={() => openLink('https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies')}>
            <Text style={styles.link}>Internet Explorer / Edge</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>
          Σημειώστε ότι η απενεργοποίηση cookies μπορεί να περιορίσει τη σωστή λειτουργία του site
          και να επηρεάσει αρνητικά την εμπειρία σας.
        </Text>
      </View>

      <Footer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f7f2',
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#222',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4a3f35',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  section: {
    marginTop: 16,
  },
});

export default CookiePolicy;

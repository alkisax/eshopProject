import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Footer from '../../../components/Footer';

const Terms = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Όροι Χρήσης</Text>
      <Text style={styles.subtitle}>Ημερομηνία Εφαρμογής: Ισχύουν από 01/11/2023</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ειδικά στοιχεία – Πληροφορίες εταιρείας</Text>
        <Text style={styles.text}>
          Η παρούσα ιστοσελίδα (εφ’ εξής «Ιστοσελίδα») ανήκει στην εταιρεία με την
          επωνυμία «*****» και τον διακριτικό τίτλο «*****» (εφ’ εξής “Εταιρεία“).
        </Text>
        <Text style={styles.text}>
          Δραστηριότητα: *****. Τα προϊόντα παρέχονται προς χονδρική ή λιανική πώληση
          μέσω του Ηλεκτρονικού Καταστήματος ή μέσω της φυσικής έδρας.
        </Text>
        <Text style={styles.text}>Διεύθυνση Έδρας: *****</Text>
        <Text style={styles.text}>E-mail: *****</Text>
        <Text style={styles.text}>ΑΦΜ: *****</Text>
        <Text style={styles.text}>Γ.Ε.Μ.Η.: *****</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Όροι Χρήσης & Πώλησης</Text>
        <Text style={styles.text}>
          Η χρήση της Ιστοσελίδας και οι αγορές σας σε αυτή διέπονται από τους
          παρακάτω όρους χρήσης («Όροι Χρήσης») και πώλησης («Όροι Πώλησης»),
          συλλογικά «οι Όροι». Με την πρόσβασή σας στην Ιστοσελίδα ή τη χρήση της,
          δηλώνετε ότι αποδέχεστε τους Όρους.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Εφαρμοστέοι Νόμοι</Text>
        <Text style={styles.text}>
          Οι Όροι διέπονται από το σύνολο των ευρωπαϊκών και εθνικών νόμων περί
          ηλεκτρονικού εμπορίου, συμπεριλαμβανομένων ενδεικτικά του ΠΔ 131/2003, του
          Ν.2251/1994, της Οδηγίας 2011/83/ΕΕ και άλλων.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Υποχρεώσεις Χρηστών</Text>
        <Text style={styles.text}>
          Η Ιστοσελίδα προορίζεται αποκλειστικά για προσωπική και μη εμπορική χρήση.
          Απαγορεύεται η αποστολή, μετάδοση, δημοσίευση ή διάδοση παράνομου,
          προσβλητικού, ενοχλητικού ή βλαβερού περιεχομένου.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Περιορισμός Ευθύνης</Text>
        <Text style={styles.text}>
          Η Εταιρεία δεν ευθύνεται για τυχόν τεχνικά προβλήματα, σφάλματα περιεχομένου
          ή τιμών, καθώς και για καθυστερήσεις που οφείλονται σε λόγους πέρα από τη
          σφαίρα επιρροής της. Οι υπηρεσίες και τα προϊόντα παρέχονται «ως έχουν».
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Πνευματικά Δικαιώματα</Text>
        <Text style={styles.text}>
          Όλα τα δικαιώματα πνευματικής και βιομηχανικής ιδιοκτησίας της Ιστοσελίδας
          και του περιεχομένου της ανήκουν στην Εταιρεία ή στους νόμιμους δικαιούχους.
          Απαγορεύεται η αντιγραφή, αναδημοσίευση ή χρήση χωρίς άδεια.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Προστασία Δεδομένων</Text>
        <Text style={styles.text}>
          Η Εταιρεία συμμορφώνεται με τον GDPR (Κανονισμός 2016/679) και την ισχύουσα
          ελληνική νομοθεσία. Διαβάστε την Πολιτική Απορρήτου και Cookies για
          περισσότερες πληροφορίες.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Επικοινωνία</Text>
        <Text style={styles.text}>
          Για οποιοδήποτε θέμα σχετικό με την Ιστοσελίδα ή τους Όρους, επικοινωνήστε
          με e-mail στο ***** ή στη διεύθυνση *****.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.caption}>
          Οι Όροι Χρήσης μπορούν να τροποποιηθούν οποιαδήποτε στιγμή χωρίς
          προειδοποίηση, σύμφωνα με την ισχύουσα νομοθεσία. Παρακαλούμε ελέγχετε
          συχνά για ενημερώσεις.
        </Text>
      </View>
      <Footer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf7',
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#4a3f35',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b5f52',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a3f35',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 6,
  },
  caption: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default Terms;

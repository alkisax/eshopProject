import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native';
import Footer from '../../../components/Footer';

const PrivacyPolicy = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <Text style={styles.title}>Πολιτική Απορρήτου</Text>

      {/* Intro */}
      <Text style={styles.paragraph}>
        Στο ***** (https://*****/), αναγνωρίζουμε τη σημασία της προστασίας των
        προσωπικών σας δεδομένων. Η παρούσα Πολιτική Απορρήτου περιγράφει τον τρόπο
        με τον οποίο συλλέγουμε, επεξεργαζόμαστε και χρησιμοποιούμε τα προσωπικά σας
        δεδομένα, καθώς και τα δικαιώματά σας όσον αφορά αυτά.
      </Text>

      {/* 2 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>2. Ποια δεδομένα συλλέγουμε;</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Δεδομένα που μας παρέχετε:</Text> Όταν δημιουργείτε
          λογαριασμό, πραγματοποιείτε αγορές ή επικοινωνείτε μαζί μας, μπορεί να μας
          δώσετε όνομα, διεύθυνση, email, τηλέφωνο, στοιχεία πληρωμής κ.α.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Δεδομένα χρήσης:</Text> Σελίδες που επισκέπτεστε,
          προϊόντα που βλέπετε ή αγοράζετε κ.α.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Τεχνικά δεδομένα:</Text> IP, λειτουργικό σύστημα,
          browser κ.α.
        </Text>
      </View>

      {/* 3 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>3. Πώς χρησιμοποιούμε τα δεδομένα σας;</Text>
        <Text style={styles.paragraph}>
          Για παροχή υπηρεσιών (διαχείριση λογαριασμού, αγορές, υποστήριξη), βελτίωση
          εμπειρίας (αναλύσεις, marketing), και προστασία νόμιμων συμφερόντων
          (αποτροπή απάτης, συμμόρφωση με νόμο).
        </Text>
      </View>

      {/* 4 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>4. Με ποιους μοιραζόμαστε τα δεδομένα σας;</Text>
        <Text style={styles.paragraph}>
          Με συνεργάτες (π.χ. courier) και με αρμόδιες αρχές, μόνο όπου είναι
          απαραίτητο.
        </Text>
      </View>

      {/* 5 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>5. Πώς διασφαλίζουμε τα δεδομένα σας;</Text>
        <Text style={styles.paragraph}>
          Χρησιμοποιούμε κρυπτογράφηση, firewalls και άλλα τεχνικά/οργανωτικά μέτρα
          ασφαλείας.
        </Text>
      </View>

      {/* 6 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>6. Ποια είναι τα δικαιώματά σας;</Text>
        <Text style={styles.paragraph}>• Δικαίωμα πρόσβασης</Text>
        <Text style={styles.paragraph}>• Δικαίωμα διόρθωσης</Text>
        <Text style={styles.paragraph}>• Δικαίωμα διαγραφής</Text>
        <Text style={styles.paragraph}>• Δικαίωμα περιορισμού</Text>
        <Text style={styles.paragraph}>• Δικαίωμα φορητότητας</Text>
        <Text style={styles.paragraph}>• Δικαίωμα εναντίωσης</Text>
        <Text style={styles.paragraph}>
          • Δικαίωμα μη λήψης αυτοματοποιημένων αποφάσεων
        </Text>
      </View>

      {/* 7 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>7. Επικοινωνία</Text>
        <Text style={styles.paragraph}>
          Για ερωτήματα/αιτήματα σχετικά με προσωπικά δεδομένα, επικοινωνήστε στο
          email: *****@*****.***
        </Text>
      </View>

      {/* 8 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>8. Αλλαγές στην Πολιτική Απορρήτου</Text>
        <Text style={styles.paragraph}>
          Η Πολιτική δύναται να τροποποιηθεί ανά πάσα στιγμή. Σας συνιστούμε να
          ελέγχετε τακτικά για ενημερώσεις.
        </Text>
      </View>

      {/* 9 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>9. Cookies</Text>
        <Text style={styles.paragraph}>
          Το ***** χρησιμοποιεί cookies για να βελτιώσει την εμπειρία σας. Δείτε την
          Πολιτική Cookies:{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://*****/politiki-cookies/')}
          >
            https://*****/politiki-cookies/
          </Text>
        </Text>
      </View>

      {/* 10 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>
          10. Αρμόδια Αρχή Προστασίας Δεδομένων
        </Text>
        <Text style={styles.paragraph}>
          Website:{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://www.dpa.gr/')}
          >
            https://www.dpa.gr/
          </Text>
          {'\n'}Τηλέφωνο: +30 210 6475600
        </Text>
      </View>

      {/* 11 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>11. Τελικές διατάξεις</Text>
        <Text style={styles.paragraph}>
          Η Πολιτική διέπεται από το ελληνικό δίκαιο. Αρμόδια δικαστήρια: Αθήνας.
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
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4a3f35',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4a3f35',
  },
  paragraph: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  link: {
    color: '#0077cc',
    textDecorationLine: 'underline',
  },
  section: {
    marginBottom: 16,
  },
});

export default PrivacyPolicy;

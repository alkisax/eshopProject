// native-eshop-project\app\index.tsx
import { useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import BlogHome from '../components/BlogHome';
import Footer from '../components/Footer'
import LatestCommodities from '@/components/LatestCommodities';
import LastAnnouncement from '@/components/LastAnnouncement';
import { UserAuthContext } from '@/context/UserAuthContext';

const Home = () => {
  const router = useRouter();

  const { user } = useContext(UserAuthContext);

  // useEffect(() => {
  //   console.log('👤 Current user:', user);
  // }, [user]);

  return (

    <>
      {user ? (
        <Text style={{ fontSize: 16, color: '#333', textAlign: 'center', marginTop: 8 }}>
          Συνδεδεμένος ως: {user.username || user.email}
        </Text>
      ) : (
        <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginTop: 8 }}>
          Δεν είστε συνδεδεμένος
        </Text>
      )}
      
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {/* Hero section */}
        <View pointerEvents="none">
          <ImageBackground
            source={{
              uri: 'https://cloud.appwrite.io/v1/storage/buckets/68a01b0400291ae356ca/files/68c955c9001658ee7294/view?project=6898d8be0020602b146e',
            }}
            style={styles.hero}
            resizeMode="cover"
          />          
        </View>

        {/* Welcome section */}
        <View style={styles.sectionOuter}>
          <View style={styles.sectionInner}>
            <Text style={styles.text}>
              Ένα μικρό εργαστήρι γεμάτο φαντασία, όπου κάθε κόσμημα φτιάχνεται στο χέρι με αγάπη και μεράκι.
              Κάθε δημιουργία είναι μοναδική και αφηγείται τη δική της ιστορία.
            </Text>
            <Text style={styles.text}>
              Σας καλωσορίζουμε στον κόσμο μας, με νέες συλλογές, δημιουργικότητα και κοσμήματα που ξεχωρίζουν.
            </Text>

            <TouchableOpacity
              style={styles.storeButtonContainer}
              activeOpacity={0.85}
              onPress={() => router.push('/store')}
            >
              <ImageBackground
                source={{
                  uri: 'https://cloud.appwrite.io/v1/storage/buckets/68a01b0400291ae356ca/files/68c958130031815f8bce/view?project=6898d8be0020602b146e',
                }}
                style={styles.storeButtonBg}
                imageStyle={styles.storeButtonBgImage}
              >
                <Text style={styles.storeButtonText}>Κατάστημα</Text>
              </ImageBackground>
            </TouchableOpacity>
            
            {/* Other two buttons */}
            <BlogHome />
          </View>
        </View>

        {/* Info section */}
        <View style={styles.section}>
          <Text style={styles.title}>Τι θα βρείτε στο εργαστήρι μας</Text>
          <Text style={styles.text}>
            Χειροποίητα κοσμήματα από ασήμι, ορείχαλκο και άλλα υλικά, σχεδιασμένα με δημιουργικότητα και φροντίδα.
          </Text>
          <Text style={styles.text}>
            Μείνετε συντονισμένοι με τις <Text style={styles.bold}>Ανακοινώσεις</Text> μας για νέες συλλογές και δείτε τα <Text style={styles.bold}>Νέα</Text> μας.
          </Text>
        </View>

        {/* last items carusel */}
        <View style={{ height: 300 }}>
          <LatestCommodities />
        </View>

        <View style={styles.announcementSection}>
          <LastAnnouncement />
        </View>

        <Footer />
      </ScrollView>    
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f7f2',
  },
  hero: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#222',
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  storeButton: {
    marginTop: 16,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
    paddingVertical: 20,
  },
  storeButtonContainer: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginTop: 16,
    elevation: 6,
  },
  storeButtonBg: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeButtonBgImage: {
    resizeMode: 'cover',
  },
  storeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9f9f9',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sectionOuter: {
    width: '100%',
    backgroundColor: '#f9f7f2',
    alignItems: 'center',
    paddingVertical: 24,
  },
  sectionInner: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 700,
    alignItems: 'center',
    elevation: 4,
  },
  announcementSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});

export default Home
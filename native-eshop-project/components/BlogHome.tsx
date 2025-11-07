// native-eshop-project\components\BlogHome.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

const BlogHome = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Νέα */}
      <TouchableOpacity
        style={styles.btnContainer}
        activeOpacity={0.85}
        onPress={() => router.push('/news')}
      >
        <ImageBackground
          source={{
            uri: 'https://cloud.appwrite.io/v1/storage/buckets/68a01b0400291ae356ca/files/68c9572500153c4aa090/view?project=6898d8be0020602b146e',
          }}
          style={styles.btnBg}
          imageStyle={styles.btnBgImage}
        >
          <Text style={styles.btnText}>Νέα</Text>
        </ImageBackground>
      </TouchableOpacity>

      {/* Ανακοινώσεις */}
      <TouchableOpacity
        style={styles.btnContainer}
        activeOpacity={0.85}
        onPress={() => router.push('/announcements')}
      >
        <ImageBackground
          source={{
            uri: 'https://cloud.appwrite.io/v1/storage/buckets/68a01b0400291ae356ca/files/68c9572b002dab2a4856/view?project=6898d8be0020602b146e',
          }}
          style={styles.btnBg}
          imageStyle={styles.btnBgImage}
        >
          <Text style={styles.btnText}>Ανακοινώσεις</Text>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  btnContainer: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  btnBg: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBgImage: {
    resizeMode: 'cover',
  },
  btnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default BlogHome;

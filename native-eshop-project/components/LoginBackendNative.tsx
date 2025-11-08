import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserAuthContext } from '@/context/UserAuthContext';
import { Ionicons } from '@expo/vector-icons'; // ✅ add icon for eye toggle

const LoginBackendNative = () => {
  const { login, isLoading } = useContext(UserAuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👁️
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');

    if (!username.trim() || !password) {
      setError('Συμπληρώστε username και κωδικό.');
      return;
    }

    const ok = await login(username.trim(), password);

    if (ok) {
      router.replace('/'); // go home on success
    } else {
      setError('Λανθασμένα στοιχεία ή σφάλμα σύνδεσης.');
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      {/* === Password input with toggle === */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
          placeholder="Κωδικός"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#48C4CF"
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Σύνδεση</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.caption}>Powered by MongoDB</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    paddingRight: 8,
  },
  eyeButton: {
    paddingHorizontal: 6,
  },
  error: {
    color: '#b00020',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#48C4CF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#BFDDE0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  caption: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
  },
});

export default LoginBackendNative;

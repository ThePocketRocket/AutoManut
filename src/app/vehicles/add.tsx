import { useRouter } from 'expo-router';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { addVeiculo } from '../../database/queries';

export default function AddVehicleScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');

  const handleSalvar = async () => {
    if (!marca || !modelo || !placa) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      await addVeiculo(db, marca, modelo, placa);
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar. Talvez essa placa já exista.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      <View style={styles.form}>
        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Toyota"
          placeholderTextColor={Colors.icon}
          value={marca}
          onChangeText={setMarca}
        />

        <Text style={styles.label}>Modelo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Corolla"
          placeholderTextColor={Colors.icon}
          value={modelo}
          onChangeText={setModelo}
        />

        <Text style={styles.label}>Placa</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: ABC-1234"
          placeholderTextColor={Colors.icon}
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSalvar}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>CADASTRAR VEÍCULO</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import { useRouter } from 'expo-router';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getVeiculos, Veiculo, registrarAbastecimento, registrarManutencao } from '../../database/queries';
import { Picker } from '@react-native-picker/picker'; // Requer react-native-picker/picker, mas podemos usar um select nativo ou botões. Vamos usar botões pra evitar deps extras.

export default function AddRegisterScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoId, setVeiculoId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<'ABASTECIMENTO' | 'MANUTENCAO'>('ABASTECIMENTO');
  
  // Campos Comuns
  const [data, setData] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [quilometragem, setQuilometragem] = useState('');
  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');
  
  // Campos Específicos
  const [litros, setLitros] = useState('');
  const [tipoServico, setTipoServico] = useState('');

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const carregarVeiculos = async () => {
    const data = await getVeiculos(db);
    setVeiculos(data);
    if (data.length > 0) {
      setVeiculoId(data[0].id);
    }
  };

  const handleSalvar = async () => {
    if (!veiculoId || !data || !quilometragem || !valor) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios (Veículo, Data, KM, Valor).');
      return;
    }

    if (tipo === 'ABASTECIMENTO' && !litros) {
      Alert.alert('Erro', 'Informe a quantidade de litros.');
      return;
    }

    if (tipo === 'MANUTENCAO' && !tipoServico) {
      Alert.alert('Erro', 'Informe o tipo de serviço (ex: Troca de Óleo).');
      return;
    }

    try {
      if (tipo === 'ABASTECIMENTO') {
        await registrarAbastecimento(db, {
          veiculo_id: veiculoId,
          data,
          quilometragem: parseFloat(quilometragem),
          valor: parseFloat(valor),
          litros: parseFloat(litros),
          observacao: observacao || undefined
        });
      } else {
        await registrarManutencao(db, {
          veiculo_id: veiculoId,
          data,
          quilometragem: parseFloat(quilometragem),
          valor: parseFloat(valor),
          tipo_servico: tipoServico,
          observacao: observacao || undefined
        });
      }
      Alert.alert('Sucesso', 'Lançamento registrado!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao registrar.');
    }
  };

  if (veiculos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{padding: 24}}>Você precisa cadastrar um veículo primeiro.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      <ScrollView contentContainerStyle={styles.form}>
        
        {/* Toggle Tipo */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, tipo === 'ABASTECIMENTO' && styles.toggleActive]}
            onPress={() => setTipo('ABASTECIMENTO')}
          >
            <Text style={[styles.toggleText, tipo === 'ABASTECIMENTO' && styles.toggleTextActive]}>Abastecimento</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, tipo === 'MANUTENCAO' && styles.toggleActive]}
            onPress={() => setTipo('MANUTENCAO')}
          >
            <Text style={[styles.toggleText, tipo === 'MANUTENCAO' && styles.toggleTextActive]}>Manutenção</Text>
          </TouchableOpacity>
        </View>

        {/* Seleção de Veículo usando botões simples para evitar Picker externo */}
        <Text style={styles.label}>Veículo</Text>
        <View style={styles.vehicleSelect}>
          {veiculos.map(v => (
            <TouchableOpacity 
              key={v.id}
              style={[styles.vehicleBtn, veiculoId === v.id && styles.vehicleBtnActive]}
              onPress={() => setVeiculoId(v.id)}
            >
              <Text style={[styles.vehicleBtnText, veiculoId === v.id && styles.vehicleBtnTextActive]}>
                {v.placa}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Data (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={data} onChangeText={setData} />

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 8}}>
            <Text style={styles.label}>Odômetro (KM)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={quilometragem} onChangeText={setQuilometragem} placeholder="Ex: 50000" />
          </View>
          <View style={{flex: 1, marginLeft: 8}}>
            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={valor} onChangeText={setValor} placeholder="Ex: 150.00" />
          </View>
        </View>

        {tipo === 'ABASTECIMENTO' ? (
          <View>
            <Text style={styles.label}>Litros</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={litros} onChangeText={setLitros} placeholder="Ex: 40.5" />
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Tipo de Serviço</Text>
            <TextInput style={styles.input} value={tipoServico} onChangeText={setTipoServico} placeholder="Ex: Troca de Óleo" />
          </View>
        )}

        <Text style={styles.label}>Observações (Opcional)</Text>
        <TextInput 
          style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
          multiline 
          value={observacao} 
          onChangeText={setObservacao} 
          placeholder="Anotações adicionais..." 
        />

        <TouchableOpacity style={styles.button} onPress={handleSalvar} activeOpacity={0.8}>
          <Text style={styles.buttonText}>REGISTRAR</Text>
        </TouchableOpacity>
        
      </ScrollView>
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 8,
    marginBottom: 24,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  vehicleSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  vehicleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  vehicleBtnText: {
    color: Colors.textSecondary,
  },
  vehicleBtnTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

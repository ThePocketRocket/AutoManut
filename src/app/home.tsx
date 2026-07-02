import { Feather, Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { verificarAlertaRevisao } from '../database/queries';

export default function HomeScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [alerta, setAlerta] = useState<{ placa: string, passou: number } | null>(null);

  useEffect(() => {
    if (isFocused) {
      carregarAlerta();
    }
  }, [isFocused]);

  const carregarAlerta = async () => {
    const res = await verificarAlertaRevisao(db);
    setAlerta(res);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />

      {/* Alerta Preventivo (RF10) */}
      {alerta && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={24} color={Colors.white} />
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>Alerta de Revisão!</Text>
            <Text style={styles.alertMessage}>
              O veículo {alerta.placa} passou {alerta.passou.toFixed(0)}km da última troca de óleo.
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.headerTitle}>Painel de Controle</Text>

      <View style={styles.grid}>
        {/* Veículos */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/vehicles')}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="car-sport" size={32} color={Colors.primary} />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Meus Veículos</Text>
            <Text style={styles.cardSubtitle}>Gerenciar frota</Text>
          </View>
        </TouchableOpacity>

        {/* Lançamentos */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/registers/add')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="receipt" size={32} color="#d97706" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Lançamentos</Text>
            <Text style={styles.cardSubtitle}>Abastecimento e Manutenção</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')} activeOpacity={0.8}>
        <Feather name="log-out" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    padding: 24,
    paddingTop: 60, // Espaço para StatusBar
  },
  alertBanner: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  alertTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  alertMessage: {
    color: Colors.white,
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d1fae5', // Emerald 100
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  logoutButton: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.danger,
  },
});

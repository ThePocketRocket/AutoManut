import { useRouter } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { getVeiculos, Veiculo, deleteVeiculo } from '../../database/queries';
import { useIsFocused } from '@react-navigation/native';

export default function VehiclesListScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  useEffect(() => {
    if (isFocused) {
      carregarVeiculos();
    }
  }, [isFocused]);

  const carregarVeiculos = async () => {
    const data = await getVeiculos(db);
    setVeiculos(data);
  };

  const handleDeletar = async (id: number) => {
    await deleteVeiculo(db, id);
    carregarVeiculos();
  };

  const renderItem = ({ item }: { item: Veiculo }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/vehicles/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.marca} {item.modelo}</Text>
        <Text style={styles.cardSubtitle}>Placa: {item.placa}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDeletar(item.id)}
      >
        <Feather name="trash-2" size={20} color={Colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      <FlatList
        data={veiculos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color={Colors.icon} />
            <Text style={styles.emptyStateText}>Nenhum veículo cadastrado.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/vehicles/add')}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  listContainer: {
    padding: 24,
    paddingBottom: 100, // Espaço pro FAB
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar, StyleSheet, Text, View, FlatList, Touchable, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { getVeiculoById, getHistoricoCronologico, calcularMediaConsumo, Veiculo, deletarRegistro } from '../../database/queries';
import { useIsFocused } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [mediaConsumo, setMediaConsumo] = useState<number | null>(null);

  useEffect(() => {
    if (isFocused && id) {
      carregarDados();
    }
  }, [isFocused, id]);

  const carregarDados = async () => {
    const vId = Number(id);
    const vData = await getVeiculoById(db, vId);
    setVeiculo(vData);

    const hData = await getHistoricoCronologico(db, vId);
    setHistorico(hData);

    const consumo = await calcularMediaConsumo(db, vId);
    setMediaConsumo(consumo);
  };

  const handleEditarRegistro = async (item : any) => {
    router.push({
      pathname: '/registers/add',
      params: {
        registroId: item.registro_id.toString(),
        tipo: item.tipo
      }
    });
  };

  const handleDeletarRegistro = async (registroId: number) => {
    await deletarRegistro(db, registroId);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyType}>
          <Feather 
            name={item.tipo === 'ABASTECIMENTO' ? 'droplet' : 'tool'} 
            size={16} 
            color={Colors.primary} 
          />
          <Text style={styles.historyTypeText}>{item.tipo}</Text>
        </View>

        <Text style={styles.historyDate}>{item.data}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              handleEditarRegistro(item);
            }}
            >
            <Feather name="edit" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={ async () => {
              await handleDeletarRegistro(item.registro_id);
              await carregarDados();
            }}
          >
            <Feather name="trash-2" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.historyBody}>
        <Text style={styles.historyInfo}>KM: {item.quilometragem}</Text>
        <Text style={styles.historyInfo}>Valor: R$ {item.valor.toFixed(2)}</Text>
        
        {item.tipo === 'ABASTECIMENTO' && (
          <Text style={styles.historyInfo}>Litros: {item.litros}</Text>
        )}
        
        {item.tipo === 'MANUTENCAO' && (
          <Text style={styles.historyInfo}>Serviço: {item.tipo_servico}</Text>
        )}
        
        {item.observacao && (
          <Text style={styles.historyObs}>Obs: {item.observacao}</Text>
        )}
      </View>
    </View>
  );

  if (!veiculo) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{veiculo.marca} {veiculo.modelo}</Text>
        <Text style={styles.subtitle}>Placa: {veiculo.placa}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {mediaConsumo ? `${mediaConsumo.toFixed(1)} km/L` : '--'}
            </Text>
            <Text style={styles.statLabel}>Média de Consumo</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Histórico de Atividades</Text>
      <FlatList
        data={historico}
        keyExtractor={item => item.registro_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum registro encontrado para este veículo.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statsContainer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    margin: 24,
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundLight,
    paddingBottom: 8,
  },
  historyType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTypeText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  historyBody: {
    gap: 4,
  },
  historyInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  historyObs: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
    backgroundColor: Colors.backgroundLight,
    padding: 8,
    borderRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: 24,
  },
  actions: {
  flexDirection: 'row',
  alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
    padding: 4,
  }
});

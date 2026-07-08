import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase } from '../database/schema';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="automanut.db" onInit={initDatabase}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="vehicles/index" options={{ title: 'Meus Veículos' }} />
        <Stack.Screen name="vehicles/add" options={{ title: 'Novo Veículo' }} />
        <Stack.Screen name="vehicles/[id]" options={{ title: 'Detalhes' }} />
        <Stack.Screen 
          name="registers/add" 
          options={({ route }) => {
            const params = route.params as {
              registroId?: string;
              tipo?: string;
            };

            if (params?.registroId) {
              return {
                title:
                  params.tipo === 'ABASTECIMENTO'
                    ? 'Editar Abastecimento'
                    : 'Editar Manutenção',
              };
            }

          return {
            title: 'Novo Lançamento',
          };
        }}
      />
    </Stack>
    </SQLiteProvider>
  );
}

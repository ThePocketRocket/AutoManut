import * as SQLite from 'expo-sqlite';

export type Veiculo = {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
};

export type RegistroAbastecimento = {
  veiculo_id: number;
  data: string;
  quilometragem: number;
  valor: number;
  litros: number;
  observacao?: string;
};

export type RegistroManutencao = {
  veiculo_id: number;
  data: string;
  quilometragem: number;
  valor: number;
  tipo_servico: string;
  observacao?: string;
};

// CRUD Veiculos
export const addVeiculo = async (db: SQLite.SQLiteDatabase, marca: string, modelo: string, placa: string) => {
  const statement = await db.prepareAsync('INSERT INTO Veiculo (marca, modelo, placa) VALUES ($marca, $modelo, $placa)');
  try {
    const result = await statement.executeAsync({ $marca: marca, $modelo: modelo, $placa: placa });
    return result.lastInsertRowId;
  } finally {
    await statement.finalizeAsync();
  }
};

export const getVeiculos = async (db: SQLite.SQLiteDatabase): Promise<Veiculo[]> => {
  return await db.getAllAsync<Veiculo>('SELECT * FROM Veiculo');
};

export const getVeiculoById = async (db: SQLite.SQLiteDatabase, id: number): Promise<Veiculo | null> => {
  return await db.getFirstAsync<Veiculo>('SELECT * FROM Veiculo WHERE id = ?', id);
};

export const deleteVeiculo = async (db: SQLite.SQLiteDatabase, id: number) => {
  // Cascata vai deletar registros associados
  const statement = await db.prepareAsync('DELETE FROM Veiculo WHERE id = $id');
  try {
    await statement.executeAsync({ $id: id });
  } finally {
    await statement.finalizeAsync();
  }
};

// Lançamentos
export const registrarAbastecimento = async (db: SQLite.SQLiteDatabase, dados: RegistroAbastecimento) => {
  // SQLite no Expo SDK 54 usa async/await pra transações se quisermos, 
  // mas pra garantir rollback se der erro, executamos uma query contínua ou usamos execAsync
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO Registro (veiculo_id, tipo, data, quilometragem, valor) VALUES (?, ?, ?, ?, ?)',
      dados.veiculo_id, 'ABASTECIMENTO', dados.data, dados.quilometragem, dados.valor
    );
    const registroId = result.lastInsertRowId;
    
    await db.runAsync(
      'INSERT INTO Abastecimento (registro_id, litros) VALUES (?, ?)',
      registroId, dados.litros
    );

    if (dados.observacao) {
      await db.runAsync(
        'INSERT INTO Observacao (registro_id, texto) VALUES (?, ?)',
        registroId, dados.observacao
      );
    }
  });
};

export const registrarManutencao = async (db: SQLite.SQLiteDatabase, dados: RegistroManutencao) => {
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO Registro (veiculo_id, tipo, data, quilometragem, valor) VALUES (?, ?, ?, ?, ?)',
      dados.veiculo_id, 'MANUTENCAO', dados.data, dados.quilometragem, dados.valor
    );
    const registroId = result.lastInsertRowId;
    
    await db.runAsync(
      'INSERT INTO Manutencao (registro_id, tipo_servico) VALUES (?, ?)',
      registroId, dados.tipo_servico
    );

    if (dados.observacao) {
      await db.runAsync(
        'INSERT INTO Observacao (registro_id, texto) VALUES (?, ?)',
        registroId, dados.observacao
      );
    }
  });
};

// Histórico Cronológico e Cálculos
export const getHistoricoCronologico = async (db: SQLite.SQLiteDatabase, veiculoId: number) => {
  const query = `
    SELECT 
      r.id as registro_id, r.tipo, r.data, r.quilometragem, r.valor,
      a.litros, m.tipo_servico, o.texto as observacao
    FROM Registro r
    LEFT JOIN Abastecimento a ON r.id = a.registro_id
    LEFT JOIN Manutencao m ON r.id = m.registro_id
    LEFT JOIN Observacao o ON r.id = o.registro_id
    WHERE r.veiculo_id = ?
    ORDER BY r.data DESC, r.quilometragem DESC
  `;
  return await db.getAllAsync<any>(query, veiculoId);
};

export const calcularMediaConsumo = async (db: SQLite.SQLiteDatabase, veiculoId: number): Promise<number | null> => {
  // Para calcular a média, precisamos de pelo menos 2 abastecimentos (para ver a variação de KM).
  const abastecimentos = await db.getAllAsync<{quilometragem: number, litros: number}>(
    `SELECT r.quilometragem, a.litros 
     FROM Registro r 
     INNER JOIN Abastecimento a ON r.id = a.registro_id 
     WHERE r.veiculo_id = ? 
     ORDER BY r.quilometragem ASC`,
    veiculoId
  );

  if (abastecimentos.length < 2) return null;

  // Calculo básico: (KM final - KM inicial) / Litros abastecidos no intervalo
  // Vamos usar (Último KM - Primeiro KM) / (Soma de todos os litros EXCETO o primeiro, pois o primeiro tanque cheio marca o início)
  const primeiroKM = abastecimentos[0].quilometragem;
  const ultimoKM = abastecimentos[abastecimentos.length - 1].quilometragem;
  const distanciaTotal = ultimoKM - primeiroKM;

  let litrosTotais = 0;
  for (let i = 1; i < abastecimentos.length; i++) {
    litrosTotais += abastecimentos[i].litros;
  }

  if (litrosTotais === 0) return null;
  return distanciaTotal / litrosTotais;
};

export const verificarAlertaRevisao = async (db: SQLite.SQLiteDatabase): Promise<{placa: string, passou: number} | null> => {
  // Alerta > 10000km da ultima troca de oleo
  const query = `
    SELECT 
      v.id as veiculo_id, v.placa,
      (SELECT MAX(quilometragem) FROM Registro WHERE veiculo_id = v.id) as km_atual,
      (SELECT MAX(r.quilometragem) 
       FROM Registro r 
       INNER JOIN Manutencao m ON r.id = m.registro_id 
       WHERE r.veiculo_id = v.id AND m.tipo_servico LIKE '%oleo%') as ultima_troca
    FROM Veiculo v
  `;
  
  const veiculos = await db.getAllAsync<any>(query);
  
  for (const v of veiculos) {
    if (v.km_atual && v.ultima_troca) {
      const diferenca = v.km_atual - v.ultima_troca;
      if (diferenca >= 10000) {
        return { placa: v.placa, passou: diferenca }; // Retorna o primeiro que precisar de alerta
      }
    }
  }
  return null;
};

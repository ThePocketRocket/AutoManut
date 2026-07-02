import * as SQLite from 'expo-sqlite';

export async function initDatabase(db: SQLite.SQLiteDatabase) {
  try {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS Veiculo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        placa TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS Registro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        veiculo_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        data TEXT NOT NULL,
        quilometragem REAL NOT NULL,
        valor REAL NOT NULL,
        FOREIGN KEY (veiculo_id) REFERENCES Veiculo (id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Abastecimento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registro_id INTEGER NOT NULL,
        litros REAL NOT NULL,
        FOREIGN KEY (registro_id) REFERENCES Registro (id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Manutencao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registro_id INTEGER NOT NULL,
        tipo_servico TEXT NOT NULL,
        FOREIGN KEY (registro_id) REFERENCES Registro (id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Observacao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registro_id INTEGER NOT NULL UNIQUE,
        texto TEXT NOT NULL,
        FOREIGN KEY (registro_id) REFERENCES Registro (id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
}

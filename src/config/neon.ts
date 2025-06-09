import { Pool } from '@neondatabase/serverless';
import { ENV } from './env';

/**
 * Creamos un Pool de @neondatabase/serverless usando tu conexión
 * a Neon (connectionString).
 *
 * De esta forma, en tus repositorios puedes hacer:
 *   const { rows } = await this.schoolDb.query<…>(...);
 * sin problemas.
 */
const pool = new Pool({
    connectionString: `postgresql://${ENV.PGUSER}:${ENV.PGPASSWORD}@${ENV.PGHOST}/${ENV.PGDATABASE}?sslmode=require`
});

// Función de prueba para verificar conexión (opcional)
export async function getPgVersion() {
    const { rows } = await pool.query<{ version: string }>(`SELECT version()`);
    return rows[0].version;
}

// Ejecutar una vez al arranque para debug
getPgVersion()
    .then(v => console.log('PostgreSQL version:', v))
    .catch(err => console.error('Error al conectar con la base de datos:', err));

export default pool;

import pool from '@/config/neon';
import type { Pool, PoolClient } from '@neondatabase/serverless';
import type { Teacher, CreateTeacher, UpdateTeacher } from '@/interfaces/teacher/teacherInterface';
import { logger } from '@/helpers/logger';

// Reuse the list of columns for all queries
const COLUMNS = [
    't.id AS uuid',
    't.name',
    't.middle_name',
    't.last_name',
    't.phone',
    't.user_fk',
    't.grade_id',
    't.location_id',
    't.created_at'
].join(', ');

/**
 * Repository for Teacher entity operations:
 * - Injects Pool for easier testing
 * - Supports transactions for writes
 * - Pagination and filtering for queries
 * - Batch inserts for bulk creation
 */
export class TeacherRepository {
    private db: Pool;
    /**
     * @param dbInstance - optional Pool instance (defaults to configured pool)
     */
    constructor(dbInstance: Pool = pool) {
        this.db = dbInstance;
    }

    /**
     * Executes a callback with a client for read operations.
     * @param fn - async function receiving a client
     * @returns result of the callback
     * @throws error if callback fails
     */
    private async withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.db.connect();
        try {
            return await fn(client);
        } catch (err) {
            logger.error('Client operation error', { error: err instanceof Error ? err.message : err });
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Executes a callback within a transaction for write operations.
     * @param fn - async function receiving a client
     * @returns result of the callback
     * @throws error and rolls back transaction if callback fails
     */
    private async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('Transaction error', { error: err instanceof Error ? err.message : err });
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves a paginated list of active teachers with optional name filters.
     * @param options.filter.name - optional filter by first name (partial match)
     * @param options.filter.lastName - optional filter by last name (partial match)
     * @param options.page - page number (1-indexed)
     * @param options.pageSize - number of records per page
     * @returns an object containing `data` array and `total` count
     */
    async findAll({ filter, page = 1, pageSize = 100 }:
        { filter?: { name?: string; lastName?: string }; page?: number; pageSize?: number }
    ): Promise<{ data: Teacher[]; total: number }> {
        return this.withClient(async client => {
            const conditions: string[] = ['u.is_active = TRUE'];
            const values: any[] = [];
            if (filter?.name) {
                values.push(`%${filter.name}%`);
                conditions.push(`t.name ILIKE $${values.length}`);
            }
            if (filter?.lastName) {
                values.push(`%${filter.lastName}%`);
                conditions.push(`t.last_name ILIKE $${values.length}`);
            }
            const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

            // Count total
            const countQuery = `SELECT COUNT(*) FROM teacher t JOIN users u ON u.id = t.user_fk ${whereClause}`;
            const { rows: countRows } = await client.query<{ count: string }>(countQuery, values);
            const total = parseInt(countRows[0].count, 10);

            // Fetch paginated data
            const offset = (page - 1) * pageSize;
            const dataQuery = `
                SELECT ${COLUMNS}
                FROM teacher t
                JOIN users u ON u.id = t.user_fk
                ${whereClause}
                ORDER BY t.created_at DESC
                LIMIT $${values.length + 1} OFFSET $${values.length + 2}
            `;
            const dataParams = [...values, pageSize, offset];
            const { rows: data } = await client.query<Teacher>(dataQuery, dataParams);

            return { data, total };
        });
    }

    /**
     * Finds an active teacher by UUID.
     * @param id - teacher UUID
     * @returns the Teacher or null if not found
     */
    async findById(id: string): Promise<Teacher | null> {
        return this.withClient(async client => {
            const query = `
                SELECT ${COLUMNS}
                FROM teacher t
                JOIN users u ON u.id = t.user_fk
                WHERE t.id = $1 AND u.is_active = TRUE
                LIMIT 1
            `;
            const { rows } = await client.query<Teacher>(query, [id]);
            return rows[0] ?? null;
        });
    }

    /**
     * Inserts a single teacher record.
     * @param data - CreateTeacher payload
     * @returns the newly created Teacher
     * @throws error if insertion fails
     */
    async createOne(data: CreateTeacher): Promise<Teacher> {
        return this.transaction(async client => {
            const columns = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
            const query = `
        INSERT INTO teacher (${columns}, created_at)
        VALUES (${placeholders}, NOW())
        RETURNING ${COLUMNS}
      `;
            const values = Object.values(data);
            const { rows } = await client.query<Teacher>(query, values);
            if (!rows.length) throw new Error('Insert failed');
            return rows[0];
        });
    }

    /**
     * Inserts multiple teacher records in a batch (limit 300).
     * @param items - array of CreateTeacher payloads
     * @returns array of created Teacher records
     * @throws error if batch size exceeds limit or any insert fails
     */
    async createMany(items: CreateTeacher[]): Promise<Teacher[]> {
        return this.transaction(async client => {
            if (items.length > 300) {
                throw new Error('Batch size exceeds 300');
            }
            const inserted: Teacher[] = [];
            for (const item of items) {
                const columns = Object.keys(item).join(', ');
                const placeholders = Object.keys(item).map((_, i) => `$${i + 1}`).join(', ');
                const query = `
          INSERT INTO teacher (${columns}, created_at)
          VALUES (${placeholders}, NOW())
          RETURNING ${COLUMNS}
        `;
                const { rows } = await client.query<Teacher>(query, Object.values(item));
                inserted.push(rows[0]);
            }
            return inserted;
        });
    }

    /**
     * Updates specified fields of an existing teacher.
     * @param id - teacher UUID
     * @param data - UpdateTeacher payload
     * @returns the updated Teacher
     * @throws error if no data provided or update fails
     */
    async update(id: string, data: UpdateTeacher): Promise<Teacher> {
        return this.transaction(async client => {
            const keys = Object.keys(data);
            if (!keys.length) throw new Error('No data to update');
            const sets = keys.map((key, i) => `${key}=$${i + 1}`).join(', ');
            const query = `
        UPDATE teacher
        SET ${sets}
        WHERE id=$${keys.length + 1}
        RETURNING ${COLUMNS}
      `;
            const values = [...Object.values(data), id];
            const { rows } = await client.query<Teacher>(query, values);
            if (!rows.length) throw new Error('Update failed');
            return rows[0];
        });
    }

    /**
     * Soft-deletes a teacher by deactivating the linked user.
     * @param id - teacher UUID
     * @throws error if deletion fails
     */
    async softDelete(id: string): Promise<void> {
        await this.transaction(async client => {
            const query = `
        UPDATE users
        SET is_active = FALSE
        WHERE id = (
          SELECT user_fk FROM teacher WHERE id = $1
        )
      `;
            const result = await client.query(query, [id]);
            if (!result.rowCount) throw new Error('Soft delete failed');
        });
    }
}

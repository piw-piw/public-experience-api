import container from '@/lib/container';
import pg from 'pg';

const { Pool } = pg;
const { POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;

const database = new Pool({
    database: process.env.POSTGRES_DATABASE,
    connectionString: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}`,
    options: `--timezone=UTC`,
    idleTimeoutMillis: 1000 * 30,
    max: 10,
});

database.on('error', (err, client) => {
    client.release();
});

container.database = database;
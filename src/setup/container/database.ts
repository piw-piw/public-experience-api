import container from '@/lib/container';
import pg from 'pg';

const { Pool } = pg;

const database = new Pool({
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: 5432,
    options: `--timezone=UTC`,
    idleTimeoutMillis: 1000 * 30,
    max: 10,
});

database.on('error', (err, client) => {
    client.release();
});

container.database = database;
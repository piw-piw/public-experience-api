import container from '@/lib/container';
import pg from 'pg';

const { Pool } = pg;

const database = new Pool({
    host: process.env.POSTGRES_HOST,
    port: 5432,
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    idleTimeoutMillis: 1000 * 30,
    max: 10,
    password: process.env.POSTGRES_PASSWORD
});

database.on('error', (err, client) => {
    client.release();
});

container.database = database;
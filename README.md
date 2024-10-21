# Public Experience API
A public API to get data in Typical Developer experiences.

# Prerequisites
- Bun
- Redis
- Postgres

# Deploying
For development, use `bun deploy:dev`. For production, use `bun deploy:prod` or `bun .` The server will be accessible on `127.0.0.1:3000`.

# Using Container
The container, which is accessible by `@/setup/container`, is implemented to make usability easier. The purpose of the container is to implement methods on startup so they can be accessible across the whole project without any weird importing.

### Accessing a Database Client
```ts
import container from `@/lib/container`;

const client = await container.database.connect();

// .. do stuff here

await client.release(); // Make sure you release the client back into the pool.
```
### Accessing the Redis instance
```ts
import container from `@/lib/container`;

const cache = await container.redis.get('key');

// .. do stuff here
```

### Extending the Container
Inside of `/src/setup`, you will notice a `container` folder. This is where all of the pieces reside. Inside of `/lib/types/types.d.ts`, you will notice a container type, this is where you where specify what can be in the container.

To extend off of the container, you *must* provide the types inside of the types file. Afterwards, you can make your container file, then add its import inside of `/src/setup/initalize.ts`.
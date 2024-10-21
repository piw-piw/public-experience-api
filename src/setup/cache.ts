import NodeSchedule from "node-schedule";
import container from "@/lib/container";
import { getMaterialStockMarket, getCurrentClassicShop, getMaterialLeaderboards } from "@/lib/util";

const cacheRunners = {
    materialStockMarket: async () => {
        const reset = ((currentHours: number) => {
            const date = new Date();

            const nextResetHour = (Math.floor((currentHours + 2) / 6) * 6 + 4) % 24;
            
            date.setUTCHours(
                nextResetHour === currentHours
                    ? (nextResetHour + 6) % 24
                    : nextResetHour,
                0, 0, 0
            );

            if (nextResetHour === 4) date.setUTCDate(date.getUTCDate() + 1);

            return date;
        })(new Date().getUTCHours());

        if (await container.redis.exists('material_stock_market')) {
            const [ next_reset ]: [number] = JSON.parse(await container.redis.get('material_stock_market') as string);
            if (next_reset === reset.getTime()) return;
        }

        const values = await getMaterialStockMarket();

        await container.redis.set('material_stock_market', JSON.stringify([reset.getTime(), values]));
    },
    classicShop: async () => {
        const reset = new Date();

        if (reset.getUTCHours() >= 16) {
            reset.setUTCDate(reset.getUTCDate() + 1);
        }

        reset.setUTCHours(reset.getUTCHours() >= 16 ? 4 : 16, 0, 0, 0);

        if (await container.redis.exists('classic_shop')) {
            const [ next_reset ]: [number] = JSON.parse(await container.redis.get('classic_shop') as string);
            if (next_reset === reset.getTime()) return;
        }

        const values = await getCurrentClassicShop();

        await container.redis.set('classic_shop', JSON.stringify([reset.getTime(), values]));
    },
    materialLeaderboard: async () => {
        const reset = new Date();
        reset.setUTCDate(reset.getUTCDate() + 1);
        reset.setUTCHours(0, 0, 0, 0);

        const values = await getMaterialLeaderboards();

        await container.redis.set('material_leaderboard', JSON.stringify([reset.getTime(), new Date().getTime(), values]));
    }
};

await Promise.all(Object.entries(cacheRunners).map(([_, func]) => func()));

// Runs every 4th, 16th hour.
NodeSchedule.scheduleJob('reset_classic_shop', '0 4,16 * * *', async () => 
    await Promise.all([
        cacheRunners.classicShop(),
    ])
);

// Runs every 4th, 10th, 16th, 22nd hour.
NodeSchedule.scheduleJob('reset_stockmarket', '0 4,10,16,22 * * *', async () => 
    await Promise.all([
        cacheRunners.materialStockMarket()
    ])
);

// Runs every 5th minute
NodeSchedule.scheduleJob('refetch_leaderboard', '*/5 * * * *', async() => 
    await Promise.all([
        cacheRunners.materialLeaderboard()
    ])
);
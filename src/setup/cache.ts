import NodeSchedule from "node-schedule";
import { getMaterialStockMarket, getCurrentClassicShop, getMaterialLeaderboards, getLastOaklandsUpdate } from "@/lib/util";
import container from "@/lib/container";

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
    },
    oaklandsUpdateCheck: async () => {
        const cachedTime = await container.redis.get('last_update_epoch');
        const updateTime = await getLastOaklandsUpdate();
        const updateTimeEpoch = Math.floor(updateTime.getTime() / 1000);

        if (!cachedTime) {
            container.events.emit('oaklands_update', { prev: 0, curr: updateTimeEpoch });
            return;
        }
    
        const lastUpdateEpoch = parseInt(cachedTime!);
    
        if (lastUpdateEpoch !== updateTimeEpoch) {
            container.events.emit('oaklands_update', { prev: 0, curr: updateTimeEpoch });
        }
    }
};

await Promise.all(Object.entries(cacheRunners).map(([_, func]) => func()));

// Runs every 5th minute
NodeSchedule.scheduleJob('refetch_leaderboard', '*/5 * * * *', async() => await Promise.all([
    cacheRunners.oaklandsUpdateCheck(),
    cacheRunners.materialLeaderboard()
]));

// Runs every 4th, 16th hour.
NodeSchedule.scheduleJob('reset_classic_shop', '0 4,16 * * *', async () => await cacheRunners.classicShop());

// Runs every 4th, 10th, 16th, 22nd hour.
NodeSchedule.scheduleJob('reset_stockmarket', '0 4,10,16,22 * * *', async () => await cacheRunners.materialStockMarket());
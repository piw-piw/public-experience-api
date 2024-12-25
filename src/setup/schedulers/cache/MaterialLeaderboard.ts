import CacheScheduler from "@/lib/structures/CacheScheduler";
import { getMaterialLeaderboards } from "@/lib/util/querying";

export default class ShipLocation extends CacheScheduler {
    constructor() {
        super({ schedule: '*/5 * * * *' });
    }

    public async run() {
        const reset = new Date();
        reset.setUTCDate(reset.getUTCDate() + 1);
        reset.setUTCHours(0, 0, 0, 0);

        this.container.logger('Fetching updated material leaderboard...');

        const { currencies, leaderboards } = await getMaterialLeaderboards();

        await this.container.redis.jsonSet('oaklands:leaderboards:material_leaderboard:reset_time', reset);
        await this.container.redis.jsonSet('oaklands:leaderboards:material_leaderboard:last_updated', new Date());
        await this.container.redis.setAdd('oaklands:leaderboards:material_leaderboard:currencies', currencies);
        await this.container.redis.jsonSet('oaklands:leaderboards:material_leaderboard:leaderboard', leaderboards);
    }
}
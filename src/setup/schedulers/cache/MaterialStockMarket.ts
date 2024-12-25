import CacheScheduler from "@/lib/structures/CacheScheduler";
import { fetchMaterialStockMarket } from "@/lib/util/execute-luau/oaklands";

export default class MaterialStockMarket extends CacheScheduler {
    constructor() {
        super({ schedule:  '0 4,10,16,22 * * *' });
    }

    private _getReset(currentHours: number) {
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
    }

    private async _cache() {
        this.container.logger('Fetching updated material stock market...');
        await fetchMaterialStockMarket();
    }

    public async run() {
        const nextReset = this._getReset(new Date().getUTCHours());
        const cachedNextReset = await this.container.redis.jsonGet('oaklands:stock_market:reset');

        if (!cachedNextReset) {
            return this._cache();
        }

        const nextResetEpoch = nextReset.getTime();
        const cachedNextResetEpoch = new Date(cachedNextReset).getTime();

        if (nextResetEpoch > cachedNextResetEpoch) {
            return this._cache();
        }
    }
}
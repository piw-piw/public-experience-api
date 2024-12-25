import CacheScheduler from "@/lib/structures/CacheScheduler";
import { fetchClassicShopItemsOnly } from "@/lib/util/execute-luau/oaklands";

export default class ClassicShop extends CacheScheduler {
    constructor() {
        super({ schedule: '0 4,16 * * *' });
    }

    private _reset(): Date { 
        const reset = new Date();

        if (reset.getUTCHours() >= 16) {
            reset.setUTCDate(reset.getUTCDate() + 1);
        }

        reset.setUTCHours(reset.getUTCHours() >= 16 ? 4 : 16, 0, 0, 0);

        return reset;
    }

    private async _cache() {
        this.container.logger('Fetching update classic shop...')
        await fetchClassicShopItemsOnly();
    }

    public async run(): Promise<void> {
        const nextReset = this._reset();
        const cachedNextReset = await this.container.redis.jsonGet('oaklands:stores:classic_shop_reset');

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
import { ExperiencesApi } from "openblox/cloud";
import CacheScheduler from "@/lib/structures/CacheScheduler";
import { OaklandsPlaceIDs, UniverseIDs } from '@/lib/types/enums';
import { cacheMissingChangelogs, cacheMissingNewsletters, fetchItems, fetchOreRarity, fetchStoreItems, fetchTranslationStrings } from "@/lib/util/execute-luau/oaklands";

export default class OaklandsUpdateCheck extends CacheScheduler {
    constructor() {
        super({ schedule: '*/5 * * * *' });
    }

    private async _cacheNewsLetters() {
        this.container.logger('Checking for new Oaklands newsletters...');
        await cacheMissingNewsletters();
    }

    private async _cacheChagnelogs() {
        this.container.logger('Checking for new Oaklands changelogs...');
        await cacheMissingChangelogs();
    }

    private async _cacheCurrentItems() {
        this.container.logger('Refetching all Oaklands items...');
        await fetchItems();
    }

    private async _cacheTranslations() {
        this.container.logger('Refetching all Oaklands translations...');
        await fetchTranslationStrings();
    }

    private async _cacheStoreItems() {
        this.container.logger('Refetching all Oaklands store items...');
        await fetchStoreItems();
    }

    private async _cacheOreRarity() {
        this.container.logger('Refetching Oaklands ore rarity...');
        await fetchOreRarity();
    }

    private async _cache(updated: Date) {
        this.container.logger(`Oaklands has been updated, recaching some data...`);

        await this._cacheNewsLetters();
        await this._cacheChagnelogs();
        await this._cacheCurrentItems();
        await this._cacheTranslations();
        await this._cacheStoreItems();
        await this._cacheOreRarity();

        this.container.redis.jsonSet('oaklands:last_update', updated);
    }

    private async _getUpdateTime(): Promise<Date> {
        const details = await ExperiencesApi.placeInfo({ universeId: UniverseIDs.Oaklands, placeId: OaklandsPlaceIDs.Production });

        if (!details) {
            throw new Error('Failed to get last update time.');
        }
    
        return details.data.updateTime;
    }

    public async run(): Promise<void> {
        this.container.logger('Checking if Oaklands has been updated recently...');

        const lastUpdate = await this._getUpdateTime();
        const cachedTime = await this.container.redis.jsonGet('oaklands:last_update');

        if (!cachedTime) {
            return this._cache(lastUpdate);
        }

        const lastUpdateEpoch = lastUpdate.getTime();
        const cachedTimeEpoch = new Date(cachedTime).getTime();

        if (lastUpdateEpoch > cachedTimeEpoch) {
            return this._cache(lastUpdate);
        }

        this.container.logger('No new Oaklands update.');
    }
}
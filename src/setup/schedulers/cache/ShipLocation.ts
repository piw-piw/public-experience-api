import CacheScheduler from "@/lib/structures/CacheScheduler";
import { fetchShipLocation } from "@/lib/util/execute-luau/oaklands";

export default class ShipLocation extends CacheScheduler {
    constructor() {
        super({ schedule: '*/60 * * * *' });
    }

    public async run() {
        const shipLocation = await this.container.redis.jsonGet('oaklands:stores:ship_location');

        if (shipLocation) {
            const date = new Date(shipLocation.reset_time).getTime();
            if (date >= Date.now()) return;
        }

        this.container.logger('Fetching updated pirate ship location.');

        await fetchShipLocation();
    }
}
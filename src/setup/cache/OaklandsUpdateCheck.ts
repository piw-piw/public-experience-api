import CachePiece from "@/lib/structures/CachePiece";
import { getLastOaklandsUpdate } from "@/lib/util";

export default class OaklandsUpdateCheck extends CachePiece {
    constructor() {
        super({ schedule:  '*/5 * * * *' })
    }

    public async run() {
        const cachedTime = await this.container.redis.get('last_update_epoch');
        const updateTime = await getLastOaklandsUpdate();
        const updateTimeEpoch = Math.floor(updateTime.getTime() / 1000);

        if (!cachedTime) {
            this.container.events.emit('oaklands_update', { prev: 0, curr: updateTimeEpoch });
            return;
        }
    
        const lastUpdateEpoch = cachedTime;
    
        if (lastUpdateEpoch !== updateTimeEpoch) {
            this.container.events.emit('oaklands_update', { prev: 0, curr: updateTimeEpoch });
        }
    }
}
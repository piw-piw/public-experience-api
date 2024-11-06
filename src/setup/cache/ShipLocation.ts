import CachePiece from "@/lib/structures/CachePiece";
import { getCurrentShipLocation } from "@/lib/util/execute-luau";

export default class ShipLocation extends CachePiece {
    constructor() {
        super({ schedule: '*/60 * * * *' });
    }

    public async run() {
        const existing = await this.container.redis.get('ship_location');
        if (existing) {
            const [ next_reset ] = existing;
            if (next_reset >= Date.now() / 1000) return;
        }

        const values = await getCurrentShipLocation();

        await this.container.redis.set('ship_location', [values.next_reset, values.current_position, values.next_position]);
    }
}
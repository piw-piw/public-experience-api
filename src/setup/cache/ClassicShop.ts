import CachePiece from "@/lib/structures/CachePiece";
import { getCurrentClassicShop } from "@/lib/util/execute-luau";

export default class ClassicShop extends CachePiece {
    constructor() {
        super({ schedule:  '0 4,16 * * *' });
    }

    public async run() {
        const reset = new Date();

        if (reset.getUTCHours() >= 16) {
            reset.setUTCDate(reset.getUTCDate() + 1);
        }

        reset.setUTCHours(reset.getUTCHours() >= 16 ? 4 : 16, 0, 0, 0);

        const existing = await this.container.redis.get('classic_shop');
        if (existing) {
            const [ next_reset ] = existing;
            if (next_reset === reset.getTime()) return;
        }

        const values = await getCurrentClassicShop();
        await this.container.redis.set('classic_shop', [reset.getTime(), values]);
    }
}
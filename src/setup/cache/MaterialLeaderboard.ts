import CachePiece from "@/lib/structures/CachePiece";
import { getMaterialLeaderboards } from "@/lib/util/querying";

export default class MaterialLeaderboard extends CachePiece {
    constructor() {
        super({ schedule:  '*/5 * * * *' });
    }

    public async run() {
        const reset = new Date();
        reset.setUTCDate(reset.getUTCDate() + 1);
        reset.setUTCHours(0, 0, 0, 0);

        const values = await getMaterialLeaderboards();

        this.container.logger('Fetching updated material leaderboard.');

        await this.container.redis.set('material_leaderboard', [reset.getTime(), new Date().getTime(), values.currencies, values.leaderboards]);
    }
}
import CachePiece from "@/lib/structures/CachePiece";
import { getMaterialStockMarket } from "@/lib/util/execute-luau";

export default class MaterialStockMarket extends CachePiece {
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

    public async run() {
        const reset = this._getReset(new Date().getUTCHours());

        const existing = await this.container.redis.get('material_leaderboard');
        if (existing) {
            const [ next_reset ] = existing;
            if (next_reset === reset.getTime()) return;
        }

        this.container.logger('Fetching updated material stock market.');

        const values = await getMaterialStockMarket();
        await this.container.redis.set('material_stock_market', [reset.getTime(), values]);
    }
}
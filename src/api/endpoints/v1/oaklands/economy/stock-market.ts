import { createRoute } from "@hono/zod-openapi";
import type { MaterialStockMarket } from "@/lib/types/experience";
import oaklands from "@/api/routes/oaklands";
import StockMarket, { StockMarketExample } from "@/lib/schemas/Oaklands/StockMarket";
import ErrorMessage from "@/lib/schemas/ErrorMessage";
import container from "@/setup/container";

const route = createRoute({
    method: "get",
    path: "/economy/stock-market",
    tags: ['Oaklands'],
    description: "Fetch the current material stock market values. The stock market resets every 6 hours.",
    responses: {
        200: {
            content: {
                "application/json": { schema: StockMarket, example: StockMarketExample }
            },
            description: "OK"
        },
        500: {
            content: {
                "application/json": { schema: ErrorMessage }
            },
            description: "INTERNAL ERROR"   
        }
    }
});

oaklands.openapi(route, async (res) => {
    if (!(await container.redis.exists('material_stock_market'))) {
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for the shop are currently not cached."
        }, 500);
    }

    const [ reset_time, items ]: [number, MaterialStockMarket] = JSON.parse((await container.redis.get('material_stock_market'))!);

    return res.json({
        reset_time: new Date(reset_time),
        trees: items.Trees,
        rocks: items.Rocks,
        ores: items.Ores
    }, 200);
});

import { createRoute } from "@hono/zod-openapi";
import type { MaterialStockMarket } from "@/lib/types/experience";
import oaklands from "@/api/routes/oaklands";
import StockMarket, { type StockMarketSchema } from "@/lib/schemas/Oaklands/StockMarket";
import ErrorMessage from "@/lib/schemas/ErrorMessage";
import container from "@/setup/container";

const example: StockMarketSchema = {
    reset_time: new Date("2024-10-02T04:00:00.000Z"),
    trees: {
        raw_petrified_oak: {
            name: "Raw Petrified Oak",
            base_value: 1.75,
            current_value: 1.4525,
            current_difference: 0.83,
            last_difference: 0.8
        }
    },
    rocks: {
        raw_sand_slate: {
            name: "Raw Sand Slate",
            base_value: 10,
            current_value: 9.9,
            current_difference: 0.99,
            last_difference: 0.95
        }
    },
    ores: {
        forged_sand: {
            name: "Forged Sand",
            base_value: 24,
            current_value: 19.20,
            current_difference: 0.8,
            last_difference: 0.92
        }
    }
}

const route = createRoute({
    method: "get",
    path: "/economy/stock-market",
    tags: ['Oaklands'],
    description: "Fetch the current material stock market values. The stock market resets every 6 hours.",
    responses: {
        200: {
            content: {
                "application/json": { schema: StockMarket, example }
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

import { createRoute } from "@hono/zod-openapi";
import type { BaseMaterial, MaterialStockMarket } from "@/lib/types/experience";
import oaklands from "@/api/routes/oaklands";
import StockMarket, { StockMarketExample } from "@/lib/schemas/Oaklands/StockMarket";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";
import type { RedisKeys } from "@/lib/types/redis-keys";

const route = createRoute({
    method: "get",
    path: "/economy/stock-market",
    tags: ['Oaklands'],
    description: "Fetch the current material stock market values. The stock market resets every 6 hours.",
    parameters: [
        { name: "materialTypes", description: "The materials that you want to include.", in: "query", required: false },
        { name: "currencyTypes", description: "The currencies that you want to include.", in: "query", required: false },
        { name: "orderDifference", description: "How you want to order the differences (asc, desc).", in: "query", required: false }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: StockMarket, example: StockMarketExample }
            },
            description: "OK"
        },
        500: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "INTERNAL ERROR"   
        }
    }
});

function _filterMaterials(materials: string[], object: RedisKeys['oaklands:stock-market:values']) {
    const keys = Object.keys(object) as string[];

    for (const key of keys) {
        if (!materials.includes(key.toLowerCase())) delete object[key];
    }

    return object;
}

function _filterCurrencies(currencies: string[], object: RedisKeys['oaklands:stock-market:values']) {
    const typeEntries = Object.entries(object) as [string, Record<string, BaseMaterial<string>>][];

    for (const [tk, tv] of typeEntries) {
        const stockEntries = Object.entries(tv);

        for (const [sk, sv] of stockEntries) {
            if (!currencies.includes(sv.currency_type.toLowerCase())) delete object[tk][sk];
        }
    }

    return object;
}

function _orderAmount(orderBy: string, object: RedisKeys['oaklands:stock-market:values']) {
    const entries = Object.entries(object) as [string, Record<string, BaseMaterial<string>>][];

    for (const [k, v] of entries) {
        const values = Object.entries(v);

        values.sort((a, b) => orderBy === 'desc'
            ? (a[1].current_difference - a[1].last_difference) - (b[1].current_difference - b[1].last_difference)
            : (b[1].current_difference - b[1].last_difference) - (a[1].current_difference - a[1].last_difference)
        );

        object[k] = values.reduce((acc, [k, v]) => ({
            [k]: v,
            ...acc
        }), {} as Record<string, BaseMaterial<string>>);
    }

    return object;
}

oaklands.openapi(route, async (res) => {
    const resetTime = await container.redis.jsonGet('oaklands:stock-market:reset');
    const updatedTime = await container.redis.jsonGet('oaklands:stock-market:updated');

    const { materialTypes, currencyTypes, orderDifference } = res.req.query();
    let market = await container.redis.jsonGet('oaklands:stock-market:values');

    if (!resetTime || !updatedTime || !market)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The material stock market is currently not cached."
        }, 500);

    if (materialTypes) {
        market = _filterMaterials(materialTypes.toLowerCase().split(','), market);
    }

    if (currencyTypes) {
        market = _filterCurrencies(currencyTypes.toLowerCase().split(','), market);
    }

    if (orderDifference) {
        const orders = [ 'asc', 'desc' ];
        
        if (orders.includes(orderDifference.toLowerCase())) {
            market = _orderAmount(orderDifference.toLowerCase(), market);
        }
    }

    return res.json({
        reset_time: new Date(resetTime),
        updated_time: new Date(updatedTime),
        trees: market.trees,
        rocks: market.rocks,
        ores: market.ores
    }, 200);
});

import { createRoute } from "@hono/zod-openapi";
import type { BaseMaterial, MaterialStockMarket } from "@/lib/types/experience";
import StockMarketMaterial, { type StockMarketMaterialSchema } from "@/lib/schemas/Oaklands/StockMarketMaterial";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage from "@/lib/schemas/ErrorMessage";
import container from "@/setup/container";

const example: StockMarketMaterialSchema = {
    name: "Raw Petrified Oak",
    base_value: 1.75,
    current_value: 1.4525,
    current_difference: 0.83,
    last_difference: 0.8
};

const route = createRoute({
    method: "get",
    path: "/economy/stock-market/{material_type}",
    tags: ['Oaklands'],
    description: "Fetch a specific value from the stock market.",
    parameters: [
        { name: 'material_type', in: 'path', required: true }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: StockMarketMaterial, example }
            },
            description: "OK"
        },
        404: {
            content: {
                "application/json": { schema: ErrorMessage }
            },
            description: "NOT FOUND"   
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

    const materialType = res.req.param('material_type');
    const [ _, items ]: [number, MaterialStockMarket] = JSON.parse((await container.redis.get('material_stock_market'))!);

    const materials = Object.values(items)
        .reduce<Record<string, BaseMaterial>>((acc, curr) => ({ ...acc, ...curr }), {});
    const material = materials[materialType];

    if (!material) {
        return res.json({
            error: "INVALID_MATERIAL",
            message: "The requested material is invalid."
        }, 404);
    }

    return res.json(material, 200);
});
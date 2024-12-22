import { createRoute } from "@hono/zod-openapi";
import StockMarketMaterial, { StockMarketMaterialExample } from "@/lib/schemas/Oaklands/StockMarketMaterial";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/economy/stock-market/{materialType}",
    tags: ['Oaklands'],
    description: "Fetch a specific value from the stock market.",
    parameters: [
        { name: 'materialType', in: 'path', required: true }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: StockMarketMaterial, example: StockMarketMaterialExample }
            },
            description: "OK"
        },
        404: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "NOT FOUND"   
        },
        500: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "INTERNAL ERROR"   
        }
    }
});

oaklands.openapi(route, async (res) => {
    const market = await container.redis.jsonGet('oaklands:stock_market:values');

    if (!market)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The material stock market is currently not cached."
        }, 500);

    const materialType = res.req.param('materialType');
    const materials = Object.values(market).reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const material = materials[materialType];

    if (!material)
        return res.json({
            error: "INVALID_MATERIAL",
            message: "The material provided is invalid."
        }, 404);

    return res.json(material, 200);
});
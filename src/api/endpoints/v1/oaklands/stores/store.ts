import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import Shop, { ShopExample } from "@/lib/schemas/Oaklands/Shop";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import type { StoresItems } from "@/lib/types/experience";
import type { ShopItemchema } from "@/lib/schemas/Oaklands/ShopItem";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/stores/{store}",
    tags: ['Oaklands'],
    description: "Get the current items for a specific store. Updates are checked for every 5 minutes.",
    parameters: [
        { name: 'store', in: 'path', required: true }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: Shop, example: ShopExample }
            },
            description: "OK"
        },
        404: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "INTERNAL ERROR"   
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
    const store = res.req.param('store');

    if (store === 'classic-shop') {
        if (!(await container.redis.exists('classic_shop'))) {
            return res.json({
                error: "INTERNAL_ERROR",
                message: "The contents for the shop are currently not cached."
            }, 500);
        }
    
        const [ reset_time, items ]: [number, ShopItemchema[]] = JSON.parse((await container.redis.get('classic_shop'))!);
    
        return res.json({
            reset_time: new Date(reset_time),
            shop_items: items
        }, 200);
    }
    
    if (!(await container.redis.exists('store_items'))) {
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for all stores are currently not cached."
        }, 500);
    }

    const stores: StoresItems = JSON.parse((await container.redis.get('store_items'))!);
    const items = stores[store.toLowerCase()];

    if (!items) return res.json({
        error: "INVALID_STORE",
        message: "The store requested does not exist."
    }, 404);

    return res.json({ shop_items: items }, 200);
});
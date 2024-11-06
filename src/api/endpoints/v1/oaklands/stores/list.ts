import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import type { StoresItems } from "@/lib/types/experience";
import ShopList from "@/lib/schemas/Oaklands/ShopList";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/stores",
    tags: ['Oaklands'],
    description: "List all of the available stores.",
    responses: {
        200: {
            content: {
                "application/json": { schema: ShopList }
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

oaklands.openapi(route, async (res) => {
    const stores = await container.redis.get('store_items');

    if (!stores)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for all stores are currently not cached."
        }, 500);

    return res.json({
        stores: [
            ...Object.keys(stores),
            "classic-shop"
        ]
    }, 200);
});
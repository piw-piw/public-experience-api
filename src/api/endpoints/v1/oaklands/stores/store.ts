import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import Shop, { ShopExample, type ShopSchema } from "@/lib/schemas/Oaklands/Shop";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";
import { getImagePath } from "@/lib/util";
import type { ShopItemSchema } from "@/lib/schemas/Oaklands/ShopItem";

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
    const { store } = res.req.param();
    const stores = await container.redis.setGet('oaklands:stores:store_list');

    if (!stores)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The current store list is not cached."
        }, 500);

    if (!stores.includes(store))
        return res.json({
            error: "INVALID_STORE",
            message: "The store provided is invalid."
        }, 404);

    const shopItemIDs = await container.redis.setGet(`oaklands:stores:item_list:${store}`);
    if (!shopItemIDs)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The current items for the store are not cached."
        }, 500);

    const shopItems: ShopItemSchema[] = [];

    for (const identifier of shopItemIDs) {
        const details = await container.redis.jsonGet(`oaklands:items:item:${identifier}`);
        if (!details || !details.store) continue;

        const image = getImagePath(details.store.type, identifier);

        const { name, description, store } = details;
        shopItems.push({
            identifier, name, description,
            image: !image.endsWith('no-image.png')
                ? `/v1/oaklands/assets/${getImagePath(details.store.type, identifier)}`
                : null,
            ...store
        });
    }

    return res.json({
        ...(store === 'classic-shop'
            ? {
                reset_time: await (async () => {
                    const resetTime = await container.redis.jsonGet(`oaklands:stores:classic_shop_reset`);
                    return resetTime!;
                })()
            }
            : {}
        ),
        shop_items: shopItems,
    }, 200);
});
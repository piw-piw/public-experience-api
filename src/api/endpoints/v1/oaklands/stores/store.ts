import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import Shop, { ShopExample } from "@/lib/schemas/Oaklands/Shop";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";
import { getImagePath } from "@/lib/util";

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
        const itemDetails = await container.redis.get('item_details');
        const shopItems = await container.redis.get('classic_shop')

        if (!itemDetails || !shopItems)
            return res.json({
                error: "INTERNAL_ERROR",
                message: "The contents for the shop are currently not cached."
            }, 500);

        const [ reset_time, items ] = shopItems;
        const details = items.map((i) => {
            const details = itemDetails[i]?.details;
            const store = itemDetails[i]?.store;

            if (!details || !store) return undefined;

            return { ...details, ...store };
        }).filter((i) => i !== undefined);

        return res.json({
            reset_time: new Date(reset_time),
            shop_items: details.map((details) => ({
                ...details,
                image: `/v1/oaklands/assets/${getImagePath(details.type, details.identifier)}`
            }))
        }, 200);
    }

    const itemDetails = await container.redis.get('item_details');
    const allStores = await container.redis.get('store_items');

    if (!itemDetails || !allStores)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for all stores are currently not cached."
        }, 500);

    const items = allStores[store.toLowerCase()];
    if (!items)
        return res.json({
            error: "INVALID_STORE",
            message: "The store requested does not exist."
        }, 404);

    const details = items.map((i) => {
        const details = itemDetails[i]?.details;
        const store = itemDetails[i]?.store;

        if (!details || !store) return undefined;

        return { ...details, ...store };
    }).filter((i) => i !== undefined);

    return res.json({ shop_items: details }, 200);
});
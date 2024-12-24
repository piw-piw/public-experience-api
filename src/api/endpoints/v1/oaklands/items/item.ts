import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import ItemDetails from "@/lib/schemas/Oaklands/ItemDetails";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/items/{identifier}",
    tags: ['Oaklands'],
    description: "Fetch information on an item.",
    parameters: [
        { name: 'identifier', in: 'path', required: true }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: ItemDetails }
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
    const { identifier } = res.req.param();
    const items = await container.redis.setGet('oaklands:items:item_list');

    if (!items)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The current items list is not cached."
        }, 500);

    if (!items.includes(res.req.param('identifier')))
        return res.json({
            error: "INVALID_ITEM",
            message: "The item provided is invalid."
        }, 404);

    const item = await container.redis.jsonGet(`oaklands:items:item:${identifier}`);
    if (!item)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The item information is currently not cached."
        }, 500);

    return res.json({
        identifier,
        ...item
    }, 200);
});
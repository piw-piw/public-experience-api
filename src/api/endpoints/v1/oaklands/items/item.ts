import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import ItemDetails from "@/lib/schemas/Oaklands/ItemDetails";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/items/{identifier}",
    tags: ['Oaklands'],
    description: "List all of the available stores.",
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
        500: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "INTERNAL ERROR"   
        }
    }
});

oaklands.openapi(route, async (res) => {
    const items = await container.redis.get('item_details');

    if (!items)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for items are currently not cached."
        }, 500);

    const identifier = res.req.param('identifier');
    const info = items[identifier];

    if (!info) 
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The requested item does not exist."
        }, 500);

    const { details, ...variants } = info;
    
    return res.json({
        identifier: details.identifier,
        name: details.name,
        description: details.description,
        ...variants
    }, 200);
});
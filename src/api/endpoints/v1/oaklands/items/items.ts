import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import ItemKeys from "@/lib/schemas/Oaklands/ItemKeys";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/items",
    tags: ['Oaklands'],
    description: "List all of the available items.",
    responses: {
        200: {
            content: {
                "application/json": { schema: ItemKeys }
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

    const keys = Object.keys(items);

    return res.json({ keys }, 200);
});
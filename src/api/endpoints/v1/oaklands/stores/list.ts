import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import ItemKeys from "@/lib/schemas/Oaklands/ItemKeys";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/stores",
    tags: ['Oaklands'],
    description: "List all of the available stores.",
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
    const stores = await container.redis.setGet('oaklands:stores:store_list');

    if (!stores) {
        return res.json({ error: "INTERNAL_ERROR", message: "The current store list is not cached." }, 500);
    }

    return res.json({ keys: stores }, 200); 
});
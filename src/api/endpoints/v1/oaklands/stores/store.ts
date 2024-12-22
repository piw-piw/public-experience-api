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
    return res.json({} as any, 200);
});
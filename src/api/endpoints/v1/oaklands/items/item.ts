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
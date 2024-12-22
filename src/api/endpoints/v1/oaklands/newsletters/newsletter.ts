import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import Newsletter from "@/lib/schemas/Oaklands/Newsletter";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/newsletters/{id}",
    tags: ['Oaklands'],
    description: "Fetch a news letter.",
    parameters: [
        { name: 'id', in: 'path', default: "latest", required: true }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: Newsletter }
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
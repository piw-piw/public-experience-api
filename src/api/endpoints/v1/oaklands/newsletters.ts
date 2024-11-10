import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import ItemKeys from "@/lib/schemas/Oaklands/ItemKeys";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/newsletters",
    tags: ['Oaklands'],
    description: "List all of the available newsletter keys.",
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
    const newsletters = await container.redis.get('news_letters');

    if (!newsletters)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for items are currently not cached."
        }, 500);

    const keys = Object.keys(newsletters.pages);

    return res.json({ keys }, 200);
});
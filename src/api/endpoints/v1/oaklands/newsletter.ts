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
        { name: 'version', in: 'path', default: "latest", required: true }
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
    const { id } = res.req.param();

    const newsletters = await container.redis.get('news_letters');

    if (!newsletters)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "Newsletters are currently not cached."
        }, 500);

    const { latest_page, pages } = newsletters;

    if (id.toLowerCase() === "latest") {
        const page = pages[latest_page];
        
        if (!page)
            return res.json({
                error: "INTERNAL_ERROR",
                message: "Unable to fetch the latest newsletter page."
            }, 500);

        return res.json(page, 200);
    }

    const page = pages[id];

    if (!page)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "Requested news letter does not exist."
        }, 500);

    return res.json(page, 200);
});
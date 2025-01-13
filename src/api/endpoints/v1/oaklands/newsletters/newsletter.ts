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
        400: {
            content: {
                "application/json": { schema: ErrorMessage, example: ErrorMessageExample }
            },
            description: "BAD REQUEST"
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
    const { id } = res.req.param();
    if (!id) return res.json({
        error: "INVALID_ID",
        message: "Please provide a valid id."
    }, 400);

    const pages = await container.redis.setGet('oaklands:newsletter:pages_list');

    if (!pages)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for the newsletters are currently not cached."
        }, 500);

    if (id === 'latest') {
        const latest = await container.redis.stringGet('oaklands:newsletter:current_page');
        if (!latest)
            return res.json({
                error: "INTERNAL_ERROR",
                message: "Latest newsletter information is currently not cached. Tell LuckFire to fix this."
            }, 500);

        const page = await container.redis.jsonGet(`oaklands:newsletter:pages:${latest}`);
        if (!page)
            return res.json({
                error: "INTERNAL_ERROR",
                message: "The page is currently not cached."
            }, 500);

        return res.json(page, 200);
    }

    if (!pages.includes(id))
        return res.json({
            error: "INVALID_PAGE",
            message: "The page provided is invalid."
        }, 404);

    const page = await container.redis.jsonGet(`oaklands:newsletter:pages:${id}`);

    if (!page)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The page is currently not cached."
        }, 500);

    return res.json(page, 200);
});
import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import VersionChangelog from "@/lib/schemas/Oaklands/Changelog";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/changelogs/{version}",
    tags: ['Oaklands'],
    description: "Fetch a changelog version.",
    parameters: [
        { name: 'version', in: 'path', default: "latest", required: true }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: VersionChangelog }
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
import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import VersionChangelog from "@/lib/schemas/Oaklands/Changelog";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/changelogs/{id}",
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
    const { id } = res.req.param();

    const changelogs = await container.redis.get('changelog');

    if (!changelogs)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "Changelogs are currently not cached."
        }, 500);

    const [ latestVersion, versions ] = changelogs;

    if (id.toLowerCase() === "latest") {
        const version = versions[latestVersion];

        if (!version)
            return res.json({
                error: "INTERNAL_ERROR",
                message: "Unable to fetch the latest changelog version."
            }, 500);

        return res.json(version, 200);
    }

    const version = versions[id];

    if (!version)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "Requested changelog version does not exist."
        }, 500);

    return res.json(version, 200);
});
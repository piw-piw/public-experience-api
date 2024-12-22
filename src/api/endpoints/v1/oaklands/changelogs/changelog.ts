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
    const { version } = res.req.param();
    const versions = await container.redis.setGet('changelog:versions_list');

    if (!versions)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "No changelogs are currently cached."
        }, 500);

    if (version === 'latest') {
        const latest = await container.redis.jsonGet('changelog:current_version');
        if (!latest)
            return res.json({
                error: "INTERNAL_ERROR",
                message: "Latest version changelog information is currently not cached. Tell LuckFire to fix this."
            }, 500);

        const changelog = await container.redis.jsonGet(`changelog:versions:${latest.version}`);
        if (!changelog)
            return res.json({
                error: "INTERNAL_ERROR",
                message: "The changelog is currently not cached."
            }, 500);

        const { _id, ...info } = changelog;

        return res.json(info, 200);
    }

    if (!versions.includes(version))
        return res.json({
            error: "INVALID_VERSION",
            message: "The version provided is invalid."
        }, 404);

    const changelog = await container.redis.jsonGet(`changelog:versions:${version}`);

    if (!changelog)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The changelog is currently not cached."
        }, 500);

    const { _id, ...info } = changelog;

    return res.json(info, 200);
});
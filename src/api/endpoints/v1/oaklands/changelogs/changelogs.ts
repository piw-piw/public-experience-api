import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import ItemKeys from "@/lib/schemas/Oaklands/ItemKeys";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/changelogs",
    tags: ['Oaklands'],
    description: "List all of the available changelog keys.",
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
    const versions = await container.redis.setGet('oaklands:changelog:versions_list');

    if (!versions)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for the changelog are currently not cached."
        }, 500);

    /**
     * This is so the changelogs are sorted by version in ascending order.
     * Requested by piw-piw.
     */
    versions.sort((a, b) => {
        const [ majorA, minorA, patchA ] = a.split('.').map(Number); 
        const [ majorB, minorB, patchB ] = b.split('.').map(Number);
        // Strings are transformed to NaN, so versions with text on the same version level are treated as in the original order.

        if (majorA < majorB) return -1;
        if (majorA > majorB) return 1;

        if (minorA < minorB) return -1;
        if (minorA > minorB) return 1;

        if (patchA < patchB) return -1;
        if (patchA > patchB) return 1;

        return 0;
    });

    return res.json({ keys: versions }, 200);
});

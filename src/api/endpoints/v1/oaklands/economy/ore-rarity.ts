import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import OreRarity from "@/lib/schemas/Oaklands/OreRarity";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/economy/ore-rarity",
    tags: ['Oaklands'],
    description: "Fetch the current ore rarity list. Updates are checked for every 5 minutes.",
    responses: {
        200: {
            content: {
                "application/json": { schema: OreRarity }
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
    const rockRNGList = await container.redis.get('current_rock_rng');

    if (!rockRNGList)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The ores list is currently not cached."
        }, 500);

    return res.json(rockRNGList, 200);
});

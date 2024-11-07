import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import Translations from "@/lib/schemas/Oaklands/Translations";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/translations/en_us",
    tags: ['Oaklands'],
    description: "Fetch an image asset.",
    responses: {
        200: {
            content: {
                "application/json": { schema: Translations }
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
    const translations = await container.redis.get('translation_strings');

    if (!translations)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "Translations are currently not cached."
        }, 500);

    const enUS = translations['en_us'];

    return res.json(enUS, 200);
});
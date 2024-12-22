import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import ItemKeys from "@/lib/schemas/Oaklands/ItemKeys";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/translations/keys",
    tags: ['Oaklands'],
    description: "List all of the available newsletter keys.",
    parameters: [
        {
            name: 'language',
            description: 'The language that you want to return strings for.',
            in: 'query',
            required: true,
            default: "en_us"
        }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: ItemKeys }
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
    const { language } = res.req.query();

    const languageExists = await container.redis.client.sIsMember('translations:languages_list', language);

    if (!languageExists)
        return res.json({
            error: "INVALID_LANGUAGE",
            message: "The language provided is invalid."
        }, 404);

    const translationStrings = await container.redis.jsonGet(`translations:language:${language}`);

    if (!translationStrings)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The translation strings for this language currently not cached."
        }, 500);

    return res.json({ keys: Object.keys(translationStrings) }, 200);
});
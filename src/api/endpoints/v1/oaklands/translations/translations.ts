import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import Translations from "@/lib/schemas/Oaklands/Translations";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";
import type { TranslationKeys } from "@/lib/types/experience";

const route = createRoute({
    method: "get",
    path: "/translations",
    tags: ['Oaklands'],
    description: "Fetch all of the current en_us translation strings.",
    parameters: [
        {
            name: 'language',
            description: 'The language that you want to return strings for.',
            in: 'query',
            required: true,
            default: "en_us"
        },
        {
            name: 'strings',
            description: 'The strings that you want to return.',
            in: 'query',
            required: true,
        }
    ],
    responses: {
        200: {
            content: {
                "application/json": { schema: Translations }
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

function _returnStrings(strings: string[], translations: TranslationKeys[string]) {
    return Object.entries(translations)
        .reduce((acc, [k,v]) => {
            if (!strings.includes(k)) return acc;
            return { ...acc, [k]: v };
        }, {} as Record<string, string>);
}

oaklands.openapi(route, async (res) => {
    const { language, strings } = res.req.query();

    if (!strings || !strings.length)
        return res.json({
            error: "INVALID_STRINGS",
            message: "Please provide a valid list of strings."
        }, 400);

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

    const returnStrings = _returnStrings(strings.split(','), translationStrings);

    if (!Object.keys(returnStrings).length)
        return res.json({
            error: "INVALID_STRINGS",
            message: "No valid strings requested were found."
        }, 400);
    
    return res.json(returnStrings, 200);
});
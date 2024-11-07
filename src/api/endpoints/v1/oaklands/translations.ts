import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import Translations from "@/lib/schemas/Oaklands/Translations";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import container from "@/lib/container";
import type { TranslationKeys } from "@/lib/types/experience";

const route = createRoute({
    method: "get",
    path: "/translations/en_us",
    tags: ['Oaklands'],
    description: "Fetch an image asset.",
    parameters: [
        {
            name: 'returnStrings',
            description: 'Return a set of strings, omitting everything else.',
            in: 'query',
            required: false,
            example: "string_one,string_two,string_three"
        }
    ],
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

function _returnStrings(strings: string[], translations: TranslationKeys[string]) {
    return Object.entries(translations)
        .reduce((acc, [k,v]) => {
            if (!strings.includes(k)) return acc;
            return { ...acc, [k]: v };
        }, {});
}

oaklands.openapi(route, async (res) => {
    const translations = await container.redis.get('translation_strings');

    if (!translations)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "Translations are currently not cached."
        }, 500);

    const enUS = translations['en_us'];

    const { returnStrings } = res.req.query();
    if (returnStrings) {
        const requestedStrings = _returnStrings(returnStrings.split(','), enUS);
        
        return res.json(requestedStrings, 200);
    }

    return res.json(enUS, 200);
});
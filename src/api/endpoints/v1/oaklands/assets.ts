import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import AssetImage from "@/lib/schemas/Oaklands/AssetImage";
import { readAssetImageBuffer } from "@/lib/util";

const route = createRoute({
    method: "get",
    path: "/assets/{type}/{identifier}",
    tags: ['Oaklands'],
    parameters: [
        { name: 'type', in: 'path', required: true },
        { name: 'identifier', in: 'path', required: true },
    ],
    description: "Fetch an image asset.",
    responses: {
        200: {
            body: {
                "image/png": { schema: AssetImage }
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
    const type = res.req.param('type');
    const [identifier, ext] = res.req.param('identifier').split('.');

    const imageBuffer = readAssetImageBuffer(type, identifier, ext);
    
    return res.body(imageBuffer, {
        headers: { 'Content-Type': 'image/png' }
    });
});
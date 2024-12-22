import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ErrorMessage, { ErrorMessageExample } from "@/lib/schemas/ErrorMessage";
import ShipLocation from "@/lib/schemas/Oaklands/ShipLocation";
import container from "@/lib/container";

const route = createRoute({
    method: "get",
    path: "/stores/pirate-ship/location",
    tags: ['Oaklands'],
    description: "Get the current pirate ship location.",
    responses: {
        200: {
            content: {
                "application/json": { schema: ShipLocation }
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
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
    const location = await container.redis.jsonGet('oaklands:stores:ship_location');

    if (!location)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The current ship location is not cached."
        }, 500);

    return res.json({
        reset_time: new Date(location.reset_time),
        current_location: location.current_position,
        next_location: location.next_position
    }, 200);
});
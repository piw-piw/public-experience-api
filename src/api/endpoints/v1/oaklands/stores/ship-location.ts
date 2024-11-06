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
    const shipLocation = await container.redis.get('ship_location');

    if (!shipLocation)
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The ship location is not cached currently."
        }, 500);

    const [ next_reset, current_loation, next_location ] = shipLocation
    const locations = ["Desert", "LowerMeadows" , "Savannah", "RiverCave" ];

    return res.json({
        reset_time: new Date(new Date(next_reset * 1000).toISOString()),
        current_location: locations[current_loation - 1] || "Unknown",
        next_location: locations[next_location - 1] || "Unknown"
    }, 200);
});
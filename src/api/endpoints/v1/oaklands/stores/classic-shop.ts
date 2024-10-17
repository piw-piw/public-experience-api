import { createRoute } from "@hono/zod-openapi";
import oaklands from "@/api/routes/oaklands";
import ClassicShop, { type ClassicShopSchema } from "@/lib/schemas/Oaklands/ClassicShop";
import ErrorMessage from "@/lib/schemas/ErrorMessage";
import container from "@/setup/container";

const example: ClassicShopSchema = {
    reset_time: new Date("2024-10-02T16:00:00.000Z"),
    items: [
      "TeamFlag",
      "BabyDucky",
      "ClassicJeepVehiclePad",
      "TobascoSauce",
      "Oakpiece",
      "BloxyCola",
      "Trowel",
      "WitchesBrew",
      "StudGift",
      "CannedBeans",
      "SubspaceTripmine",
      "RocketLauncher"
    ]
}

const route = createRoute({
    method: "get",
    path: "/stores/classic-shop",
    tags: ['Oaklands'],
    description: "Get the current classic shop. The shop resets every 12 hours.",
    responses: {
        200: {
            content: {
                "application/json": { schema: ClassicShop, example }
            },
            description: "OK"
        },
        500: {
            content: {
                "application/json": { schema: ErrorMessage }
            },
            description: "INTERNAL ERROR"   
        }
    }
});

oaklands.openapi(route, async (res) => {
    if (!(await container.redis.exists('classic_shop'))) {
        return res.json({
            error: "INTERNAL_ERROR",
            message: "The contents for the shop are currently not cached."
        }, 500);
    }

    const [ reset_time, items ]: [number, string[]] = JSON.parse((await container.redis.get('classic_shop'))!);
    return res.json({ reset_time: new Date(reset_time), items }, 200);
});
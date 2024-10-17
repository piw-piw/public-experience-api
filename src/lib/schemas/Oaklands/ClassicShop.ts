import { z } from '@hono/zod-openapi';

const ClassicShop = z.object({
    reset_time: z.date(),
    items: z.string().array()
});

export type ClassicShopSchema = z.infer<typeof ClassicShop>;

export const ClassicShopExample: ClassicShopSchema = {
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

export default ClassicShop;
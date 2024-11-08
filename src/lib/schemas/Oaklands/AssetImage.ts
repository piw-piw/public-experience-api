import { z } from '@hono/zod-openapi';

const AssetImage = z.instanceof(ArrayBuffer);

export default AssetImage;
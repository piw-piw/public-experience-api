import { z } from '@hono/zod-openapi';

const Translations = z.record(z.string());

export type TranslationsSchema = z.infer<typeof Translations>;

export default Translations;
import { z } from '@hono/zod-openapi';

const VersionChangelog = z.object({
    date: z.string(),
    changed: z.string().array(),
    added: z.string().array(),
    fixed: z.string().array(),
});

export type VersionChangelogSchema = z.infer<typeof VersionChangelog>;

export default VersionChangelog;
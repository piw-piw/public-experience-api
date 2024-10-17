import { z } from '@hono/zod-openapi';

const ErrorMessage = z.object({
    error: z.string(),
    message: z.string()
});

export type ErrorMessageSchema = z.infer<typeof ErrorMessage>;

export const ErrorMessageExample: ErrorMessageSchema = {
    error: "INTERNAL_ERROR",
    message: "The server was unable to process the request."
}

export default ErrorMessage;
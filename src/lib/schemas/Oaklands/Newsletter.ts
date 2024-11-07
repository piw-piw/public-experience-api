import { z } from '@hono/zod-openapi';

const NewsletterParagraph = z.object({ type: z.literal("Paragraph"), text: z.string() });
const NewsletterImage = z.object({ type: z.literal("Image"), image_id: z.string() });
const NewsletterImageCarousel = z.object({ type: z.literal("ImageCarousel"), image_ids: z.string().array() });
const NewsletterVideo = z.object({ type: z.literal("Video"), video_id: z.string() });

const NewsletterSection = z.object({
    header: z.string(),
    content: z.union([
        NewsletterParagraph,
        NewsletterImage,
        NewsletterImageCarousel,
        NewsletterVideo
    ]).array(),
});
  
const Newsletter = z.object({
    banner_image_id: z.string(),
    header_text: z.string(),
    subheader_text: z.string(),
    sections: NewsletterSection.array()
});

export type NewsletterSchema = z.infer<typeof Newsletter>;

export default Newsletter;
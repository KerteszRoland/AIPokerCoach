import { z } from "zod";

export type HandReview = z.infer<typeof handReviewSchema>;

export const handReviewCreateSchema = z.object({
  overall_summary: z.string(),
  action_reviews: z.array(
    z.object({
      action_number: z.number(),
      action_description: z.string(),
      rating: z.string(),
      analysis: z.string(),
      alternatives: z.string(),
    })
  ),
  key_takeaways: z.array(z.string()),
});

export const handReviewSchema = z.object({
  id: z.string(),
  handId: z.string(),
  content: handReviewCreateSchema,
  createdAt: z.string(),
});

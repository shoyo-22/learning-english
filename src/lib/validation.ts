import { z } from "zod";
import { categories, levels } from "./types";
export const answerSchema = z
  .object({
    questionId: z.string().min(1).max(60),
    answer: z.string().trim().min(1).max(1000),
  })
  .strict();
export const practiceSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("check"),
      questionId: z.string().max(60),
      answer: z.string().trim().min(1).max(1000),
    })
    .strict(),
  z
    .object({
      action: z.literal("complete"),
      runId: z.uuid(),
      level: z.enum(levels),
      category: z.enum(["All categories", ...categories]),
      answers: z.array(answerSchema).min(1).max(10),
    })
    .strict(),
]);
export const assessmentSchema = z
  .object({
    type: z.enum(["before", "after"]),
    answers: z.array(answerSchema).length(8),
  })
  .strict();
export const aiSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(2000),
          })
          .strict(),
      )
      .min(1)
      .max(8),
  })
  .strict()
  .refine(
    (v) => v.messages[v.messages.length - 1].role === "user",
    "End with a user message.",
  );
export const eventSchema = z
  .object({
    name: z.enum([
      "visit",
      "practice_started",
      "question_answered",
      "speaking_topic_opened",
      "prompt_copied",
    ]),
    detail: z.string().max(80).optional(),
  })
  .strict();

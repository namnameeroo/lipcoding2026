import {z} from "zod";
import {EMOTION_TAGS, MOOD_EMOJIS, TASK_STATUSES} from "@/types/tasks";

export const analyzeTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(60),
    twoMinuteAction: z.string().trim().min(1).max(160),
  })
  .strict();

export const analyzeGoalResultSchema = z
  .object({
    goal: z.string().trim().min(1).max(300),
    emotionTag: z.enum(EMOTION_TAGS),
    tasks: z.array(analyzeTaskSchema).min(5).max(10),
  })
  .strict()
  .superRefine((result, context) => {
    const seen = new Set<string>();

    result.tasks.forEach((task, index) => {
      const key = `${task.title.trim()}|${task.twoMinuteAction.trim()}`.toLowerCase();

      if (seen.has(key)) {
        context.addIssue({
          code: "custom",
          message: "Duplicate task",
          path: ["tasks", index],
        });
      }

      seen.add(key);
    });
  });

export const microTaskSchema = analyzeTaskSchema.extend({
  id: z.string().min(1),
  status: z.enum(TASK_STATUSES),
  mood: z.enum(MOOD_EMOJIS).optional(),
  completedAt: z.string().min(1).optional(),
});

export const taskSessionSchema = z
  .object({
    id: z.string().min(1),
    goal: z.string().trim().min(1).max(300),
    emotionTag: z.enum(EMOTION_TAGS),
    tasks: z.array(microTaskSchema).min(5).max(10),
    currentIndex: z.number().int().min(0),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    completedAt: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((session, context) => {
    if (session.currentIndex >= session.tasks.length) {
      context.addIssue({
        code: "custom",
        message: "currentIndex is outside the task range",
        path: ["currentIndex"],
      });
    }
  });

export const persistedTaskSessionSchema = z
  .object({
    schemaVersion: z.literal(1),
    session: taskSessionSchema,
  })
  .strict();

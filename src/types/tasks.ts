export const EMOTION_TAGS = [
  "burden",
  "creative",
  "difficult",
  "urgent",
  "routine",
  "new",
] as const;

export type EmotionTag = (typeof EMOTION_TAGS)[number];

export const TASK_STATUSES = ["pending", "started", "done"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const MOOD_EMOJIS = [
  "happy",
  "frustrated",
  "tired",
  "neutral",
  "proud",
] as const;

export type MoodEmoji = (typeof MOOD_EMOJIS)[number];

export type AnalyzeTask = {
  title: string;
  twoMinuteAction: string;
};

export type AnalyzeGoalResult = {
  goal: string;
  emotionTag: EmotionTag;
  tasks: AnalyzeTask[];
};

export type MicroTask = AnalyzeTask & {
  id: string;
  status: TaskStatus;
  mood?: MoodEmoji;
  completedAt?: string;
};

export type TaskSession = {
  id: string;
  goal: string;
  emotionTag: EmotionTag;
  tasks: MicroTask[];
  currentIndex: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type PersistedTaskSession = {
  schemaVersion: 1;
  session: TaskSession;
};

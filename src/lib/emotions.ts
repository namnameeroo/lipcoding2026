import type {EmotionTag, MoodEmoji} from "@/types/tasks";

export type EmotionProfile = {
  tag: EmotionTag;
  emoji: string;
  label: string;
  shortLabel: string;
  description: string;
  shape: string;
  movement: string;
  colors: [string, string, string];
  fallbackClassName: string;
  speed: number;
  roughness: number;
  noise: number;
};

export const emotionProfiles: Record<EmotionTag, EmotionProfile> = {
  burden: {
    tag: "burden",
    emoji: "😰",
    label: "부담스러운 일",
    shortLabel: "부담",
    description: "무거운 목표도 딱 한 조각만 들어 올리면 돼요.",
    shape: "dodecahedron",
    movement: "느리고 묵직하게 흔들림",
    colors: ["#7a7a6e", "#5a5a4a", "#8a8070"],
    fallbackClassName: "ddak-shape-burden",
    speed: 0.35,
    roughness: 0.9,
    noise: 0.2,
  },
  creative: {
    tag: "creative",
    emoji: "🎨",
    label: "창의적인 일",
    shortLabel: "창의",
    description: "완성 말고 첫 흔적만 남기면 충분해요.",
    shape: "blob",
    movement: "경쾌하게 튀어오름",
    colors: ["#ff6b9d", "#c77dff", "#48cae4"],
    fallbackClassName: "ddak-shape-creative",
    speed: 1.2,
    roughness: 0.15,
    noise: 0.8,
  },
  difficult: {
    tag: "difficult",
    emoji: "🔪",
    label: "까다로운 일",
    shortLabel: "까다로움",
    description: "복잡한 건 잠시 접고 지금 손으로 할 행동만 봐요.",
    shape: "icosahedron",
    movement: "작게 떨림",
    colors: ["#9b2226", "#6a0572", "#d62828"],
    fallbackClassName: "ddak-shape-difficult",
    speed: 0.75,
    roughness: 0.5,
    noise: 1.4,
  },
  urgent: {
    tag: "urgent",
    emoji: "🔥",
    label: "긴급한 일",
    shortLabel: "긴급",
    description: "급할수록 첫 2분만 작게 잘라 시작해요.",
    shape: "spike",
    movement: "빠르게 진동",
    colors: ["#f77f00", "#d62828", "#fcbf49"],
    fallbackClassName: "ddak-shape-urgent",
    speed: 1.8,
    roughness: 0.35,
    noise: 1.8,
  },
  routine: {
    tag: "routine",
    emoji: "😴",
    label: "반복적인 일",
    shortLabel: "반복",
    description: "재미없어도 아주 낮은 턱 하나만 넘으면 돼요.",
    shape: "flat blob",
    movement: "거의 멈춘 듯 천천히 움직임",
    colors: ["#e9c46a", "#d4c5a9", "#b5b5a5"],
    fallbackClassName: "ddak-shape-routine",
    speed: 0.18,
    roughness: 0.7,
    noise: 0.1,
  },
  new: {
    tag: "new",
    emoji: "🌱",
    label: "새로 시작하는 일",
    shortLabel: "시작",
    description: "처음은 작게 심는 것으로 충분해요.",
    shape: "seed",
    movement: "천천히 자라남",
    colors: ["#52b788", "#74c69d", "#b7e4c7"],
    fallbackClassName: "ddak-shape-new",
    speed: 0.5,
    roughness: 0.2,
    noise: 0.4,
  },
};

export const moodOptions: {
  mood: MoodEmoji;
  emoji: string;
  label: string;
}[] = [
  {mood: "happy", emoji: "😊", label: "가벼워졌어요"},
  {mood: "frustrated", emoji: "😤", label: "조금 답답해요"},
  {mood: "tired", emoji: "😴", label: "피곤해요"},
  {mood: "neutral", emoji: "🙂", label: "괜찮아요"},
  {mood: "proud", emoji: "💪", label: "뿌듯해요"},
];

export function getEmotionProfile(tag: EmotionTag): EmotionProfile {
  return emotionProfiles[tag];
}

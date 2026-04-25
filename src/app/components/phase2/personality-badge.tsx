import type { PersonalityArchetype } from "@studii/shared";

export const PERSONALITY_COPY: Record<PersonalityArchetype, { title: string; blurb: string }> = {
  Sprinter: {
    title: "The Sprinter",
    blurb: "Short, focused bursts — you move fast and lock in with Pomodoros.",
  },
  Marathoner: {
    title: "The Marathoner",
    blurb: "Long sessions are your superpower. Depth over speed.",
  },
  "Night Owl": {
    title: "The Night Owl",
    blurb: "Your peak energy lands later in the day — lean into it.",
  },
  "Early Riser": {
    title: "The Early Riser",
    blurb: "Mornings are your runway — consistency shows in your hours.",
  },
  "Social Learner": {
    title: "The Social Learner",
    blurb: "Studying alongside friends fuels you — overlap is a feature.",
  },
  "Solo Grinder": {
    title: "The Solo Grinder",
    blurb: "Head-down focus. You build momentum without needing the crowd.",
  },
};

export interface PersonalityBadgeProps {
  /** Cached archetype label from `users.stats.personality`. */
  personality: PersonalityArchetype;
  /** Larger variant for Wrapped hero. */
  size?: "md" | "lg";
}

/**
 * Displays the Phase 2 study personality archetype with a short explainer.
 */
export function PersonalityBadge({ personality, size = "md" }: PersonalityBadgeProps) {
  const meta = PERSONALITY_COPY[personality];
  const isLg = size === "lg";

  return (
    <div
      className={`rounded-[2rem] border-2 border-[#508CA4]/30 bg-gradient-to-br from-[#508CA4]/15 to-white/90 shadow-lg ${
        isLg ? "p-8" : "p-6"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#508CA4] mb-2">Study personality</p>
      <h3 className={`font-bold text-[#22223B] ${isLg ? "text-3xl mb-3" : "text-xl mb-2"}`}>
        {meta.title}
      </h3>
      <p className={`text-[#22223B]/75 font-medium leading-relaxed ${isLg ? "text-lg" : "text-sm"}`}>
        {meta.blurb}
      </p>
    </div>
  );
}

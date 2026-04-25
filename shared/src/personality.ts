import type { PersonalityArchetype, PersonalityInputs } from "./types";

const ORDER: PersonalityArchetype[] = [
  "Sprinter",
  "Marathoner",
  "Night Owl",
  "Early Riser",
  "Social Learner",
  "Solo Grinder",
];

/**
 * Draft deterministic classifier: scores each archetype from inputs, picks max score;
 * ties break by fixed ORDER (product sign-off).
 */
export function classifyPersonality(inputs: PersonalityInputs): PersonalityArchetype {
  const scores: Record<PersonalityArchetype, number> = {
    Sprinter: scoreSprinter(inputs),
    Marathoner: scoreMarathoner(inputs),
    "Night Owl": scoreNightOwl(inputs),
    "Early Riser": scoreEarlyRiser(inputs),
    "Social Learner": scoreSocialLearner(inputs),
    "Solo Grinder": scoreSoloGrinder(inputs),
  };

  let best: PersonalityArchetype = "Solo Grinder";
  let bestScore = -1;
  for (const archetype of ORDER) {
    const s = scores[archetype];
    if (s > bestScore) {
      bestScore = s;
      best = archetype;
    }
  }
  return best;
}

function scoreSprinter(i: PersonalityInputs): number {
  // Short median sessions + decent pomodoro usage.
  const shortBonus = i.medianSessionMin <= 28 ? 35 : Math.max(0, 35 - (i.medianSessionMin - 28));
  return shortBonus + i.pomodoroCompletionRate * 30;
}

function scoreMarathoner(i: PersonalityInputs): number {
  return i.medianSessionMin >= 45 ? 40 + Math.min(30, (i.medianSessionMin - 45) * 0.5) : 0;
}

function scoreNightOwl(i: PersonalityInputs): number {
  // Peak at or after 8pm, or before 5am bucket as night.
  const night =
    i.peakHour >= 20 || i.peakHour <= 4
      ? 50
      : Math.max(0, 30 - Math.abs(i.peakHour - 22) * 2);
  return night;
}

function scoreEarlyRiser(i: PersonalityInputs): number {
  const morning = i.peakHour >= 5 && i.peakHour <= 11 ? 50 - Math.abs(i.peakHour - 8) * 4 : 0;
  return Math.max(0, morning);
}

function scoreSocialLearner(i: PersonalityInputs): number {
  return i.normalizedFriendOverlap * 80;
}

function scoreSoloGrinder(i: PersonalityInputs): number {
  const solo = (1 - i.normalizedFriendOverlap) * 40;
  const consistency = i.pomodoroCompletionRate * 25;
  return solo + consistency;
}


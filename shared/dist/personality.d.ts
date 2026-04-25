import type { PersonalityArchetype, PersonalityInputs } from "./types";
/**
 * Draft deterministic classifier: scores each archetype from inputs, picks max score;
 * ties break by fixed ORDER (product sign-off).
 */
export declare function classifyPersonality(inputs: PersonalityInputs): PersonalityArchetype;
//# sourceMappingURL=personality.d.ts.map
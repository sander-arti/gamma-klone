/**
 * Test script for timeline_step schema validation
 */

import { BlockSchema, TimelineStepBlockContent } from "@/lib/schemas/block";
import { validateBlock } from "@/lib/editor/constraints";

// Test valid timeline_step
const validTimelineStep = {
  kind: "timeline_step" as const,
  step: 1,
  text: "Phase 1: Planning",
  description: "Define scope and requirements",
  status: "completed" as const,
};

// Test invalid timeline_step (text too long)
const invalidTimelineStep = {
  kind: "timeline_step" as const,
  step: 1,
  text: "This is a very long title that exceeds the maximum character limit of 80 characters which should fail validation",
  description: "Short description",
  status: "current" as const,
};

console.log("Testing timeline_step schema...\n");

// Test BlockSchema parsing
console.log("1. BlockSchema parsing:");
const validResult = BlockSchema.safeParse(validTimelineStep);
console.log(`   Valid timeline_step: ${validResult.success ? "PASS" : "FAIL"}`);

const invalidResult = BlockSchema.safeParse({
  kind: "timeline_step",
  // Missing step and text
});
console.log(
  `   Invalid timeline_step (missing fields): ${!invalidResult.success ? "PASS (rejected)" : "FAIL (should reject)"}`
);

// Test TimelineStepBlockContent
console.log("\n2. TimelineStepBlockContent parsing:");
const contentValid = TimelineStepBlockContent.safeParse({
  step: 2,
  title: "Phase 2",
  description: "Implementation phase",
  status: "current",
});
console.log(`   Valid content: ${contentValid.success ? "PASS" : "FAIL"}`);

const contentInvalid = TimelineStepBlockContent.safeParse({
  step: 0, // Below minimum
  title: "Test",
});
console.log(
  `   Invalid step (0) rejected: ${!contentInvalid.success ? "PASS" : "FAIL"}`
);

// Test constraint validation
console.log("\n3. Constraint validation:");
const violations1 = validateBlock(validTimelineStep, 0, 0);
console.log(
  `   Valid timeline_step violations: ${violations1.length === 0 ? "PASS (0 violations)" : "FAIL (" + violations1.length + " violations)"}`
);

const violations2 = validateBlock(invalidTimelineStep, 0, 0);
console.log(
  `   Invalid timeline_step violations: ${violations2.length > 0 ? "PASS (" + violations2.length + " violation(s))" : "FAIL"}`
);
if (violations2.length > 0) {
  violations2.forEach((v) => console.log(`      - ${v.message}`));
}

console.log("\nAll schema tests completed!");

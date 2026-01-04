/**
 * Test script for stat_block schema validation
 */

import { BlockSchema, StatBlockContent } from "@/lib/schemas/block";
import { validateBlock } from "@/lib/editor/constraints";

// Test valid stat_block
const validStatBlock = {
  kind: "stat_block" as const,
  value: "95%",
  label: "Kundetilfredshet",
  sublabel: "Opp fra 87%",
};

// Test invalid stat_block (value too long)
const invalidStatBlock = {
  kind: "stat_block" as const,
  value: "This value is way too long and should fail validation",
  label: "Test",
};

console.log("Testing stat_block schema...\n");

// Test BlockSchema parsing
console.log("1. BlockSchema parsing:");
const validResult = BlockSchema.safeParse(validStatBlock);
console.log(`   Valid stat_block: ${validResult.success ? "PASS" : "FAIL"}`);

const invalidResult = BlockSchema.safeParse({
  kind: "stat_block",
  // Missing value and label
});
console.log(
  `   Invalid stat_block (missing fields): ${!invalidResult.success ? "PASS (rejected)" : "FAIL (should reject)"}`
);

// Test StatBlockContent
console.log("\n2. StatBlockContent parsing:");
const contentValid = StatBlockContent.safeParse({
  value: "42",
  label: "Answer",
});
console.log(`   Valid content: ${contentValid.success ? "PASS" : "FAIL"}`);

const contentInvalid = StatBlockContent.safeParse({
  value: "", // Too short
  label: "Test",
});
console.log(
  `   Empty value rejected: ${!contentInvalid.success ? "PASS" : "FAIL"}`
);

// Test constraint validation
console.log("\n3. Constraint validation:");
const violations1 = validateBlock(validStatBlock, 0, 0);
console.log(`   Valid stat_block violations: ${violations1.length === 0 ? "PASS (0 violations)" : "FAIL"}`);

const violations2 = validateBlock(invalidStatBlock, 0, 0);
console.log(
  `   Invalid stat_block violations: ${violations2.length > 0 ? "PASS (" + violations2.length + " violation(s))" : "FAIL"}`
);
if (violations2.length > 0) {
  violations2.forEach((v) => console.log(`      - ${v.message}`));
}

console.log("\n All schema tests completed!");

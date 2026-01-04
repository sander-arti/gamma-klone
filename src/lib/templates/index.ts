/**
 * Golden Templates Index
 *
 * Exports all golden templates and utility functions
 * for template-based generation.
 */

export * from "./types";
export { executiveBriefTemplate } from "./executive-brief";

import type { GoldenTemplate, GoldenTemplateId } from "./types";
import { executiveBriefTemplate } from "./executive-brief";

/**
 * Registry of all available golden templates
 */
export const goldenTemplates: Record<GoldenTemplateId, GoldenTemplate> = {
  executive_brief: executiveBriefTemplate,
  // Future templates:
  // feature_showcase: featureShowcaseTemplate,
  // project_update: projectUpdateTemplate,
} as Record<GoldenTemplateId, GoldenTemplate>;

/**
 * Get a template by ID
 */
export function getGoldenTemplate(id: GoldenTemplateId): GoldenTemplate | undefined {
  return goldenTemplates[id];
}

/**
 * List all available template IDs
 */
export function listGoldenTemplateIds(): GoldenTemplateId[] {
  return Object.keys(goldenTemplates) as GoldenTemplateId[];
}

/**
 * Check if a template ID is valid
 */
export function isValidGoldenTemplateId(id: string): id is GoldenTemplateId {
  return id in goldenTemplates;
}

/**
 * Get template metadata for selection UI
 */
export function getTemplateOptions(): Array<{
  id: GoldenTemplateId;
  name: string;
  description: string;
  slideCount: number;
}> {
  return Object.values(goldenTemplates).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    slideCount: template.slideCount,
  }));
}

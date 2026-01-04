/**
 * Custom Hooks
 *
 * Re-exports all custom hooks for easier imports.
 */

export { useBlockValidation, getBulletItemValidation } from "./useBlockValidation";
export type { BlockValidationResult } from "./useBlockValidation";

export { useSlideAIActions } from "./useSlideAIActions";

export { useShare } from "./useShare";

export { useExport } from "./useExport";
export type { ExportStatus, ExportFormat } from "./useExport";

export { useDebounce, useDebouncedCallback, useDebouncedCallbackWithFlush } from "./useDebounce";

export { useAutoSave } from "./useAutoSave";
export type { UseAutoSaveOptions, UseAutoSaveReturn } from "./useAutoSave";

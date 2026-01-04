"use client";

/**
 * EditableBlockRenderer Component
 *
 * Factory component that renders editable block components
 * connected to the editor context for inline editing.
 * Includes real-time validation and character counters.
 */

import { useCallback } from "react";
import type { Block } from "@/lib/schemas/block";
import { useEditor } from "@/components/editor/EditorProvider";
import { createBlockId } from "@/lib/editor/constraints";
import { useBlockValidation } from "@/lib/hooks/useBlockValidation";
import { CharacterCounter, ItemCounter, CompactOverflowWarning } from "@/components/editor";
import { TitleBlock } from "./TitleBlock";
import { TextBlock } from "./TextBlock";
import { BulletsBlock } from "./BulletsBlock";
import { ImageBlock } from "./ImageBlock";
import { TableBlock } from "./TableBlock";
import { CalloutBlock } from "./CalloutBlock";
import { EditableStatBlock } from "./EditableStatBlock";
import { EditableTimelineStepBlock } from "./EditableTimelineStepBlock";
import { EditableIconCardBlock } from "./EditableIconCardBlock";
import { EditableNumberedCardBlock } from "./EditableNumberedCardBlock";

interface EditableBlockRendererProps {
  block: Block;
  /** Slide index in the deck */
  slideIndex: number;
  /** Block index within the slide */
  blockIndex: number;
  /** Title level: 1 for slide title, 2 for section heading */
  titleLevel?: 1 | 2;
  /** Additional CSS classes */
  className?: string;
  /** Show character counter */
  showCounter?: boolean;
}

export function EditableBlockRenderer({
  block,
  slideIndex,
  blockIndex,
  titleLevel = 2,
  className = "",
  showCounter = true,
}: EditableBlockRendererProps) {
  const { state, actions } = useEditor();

  const blockId = createBlockId(slideIndex, blockIndex);
  const isEditing = state.editingBlockId === blockId;

  // Get validation state for this block
  const validation = useBlockValidation(block, slideIndex, blockIndex);

  // Start editing this block
  const handleClick = useCallback(() => {
    actions.startEditing(blockId);
  }, [actions, blockId]);

  // Stop editing
  const handleBlur = useCallback(() => {
    actions.stopEditing();
  }, [actions]);

  // Update text-based block content
  const handleTextChange = useCallback(
    (text: string) => {
      actions.updateBlock(slideIndex, blockIndex, { text });
    },
    [actions, slideIndex, blockIndex]
  );

  // Update bullets items
  const handleItemsChange = useCallback(
    (items: string[]) => {
      actions.updateBlock(slideIndex, blockIndex, { items });
    },
    [actions, slideIndex, blockIndex]
  );

  // Update table columns
  const handleColumnsChange = useCallback(
    (columns: string[]) => {
      actions.updateBlock(slideIndex, blockIndex, { columns });
    },
    [actions, slideIndex, blockIndex]
  );

  // Update table rows
  const handleRowsChange = useCallback(
    (rows: string[][]) => {
      actions.updateBlock(slideIndex, blockIndex, { rows });
    },
    [actions, slideIndex, blockIndex]
  );

  // Update stat_block fields
  const handleStatFieldChange = useCallback(
    (field: "value" | "label" | "sublabel", value: string) => {
      actions.updateBlock(slideIndex, blockIndex, { [field]: value });
    },
    [actions, slideIndex, blockIndex]
  );

  // Update timeline_step fields (maps "title" -> "text" for schema compatibility)
  const handleTimelineFieldChange = useCallback(
    (field: "step" | "title" | "description" | "status", value: string | number) => {
      // Map "title" to "text" since Block schema uses "text" for timeline_step title
      const schemaField = field === "title" ? "text" : field;
      actions.updateBlock(slideIndex, blockIndex, { [schemaField]: value });
    },
    [actions, slideIndex, blockIndex]
  );

  // Update icon_card fields
  const handleIconCardFieldChange = useCallback(
    (field: "icon" | "text" | "description" | "bgColor", value: string) => {
      actions.updateBlock(slideIndex, blockIndex, { [field]: value });
    },
    [actions, slideIndex, blockIndex]
  );

  // Update numbered_card fields
  const handleNumberedCardFieldChange = useCallback(
    (field: "number" | "text" | "description", value: string | number) => {
      actions.updateBlock(slideIndex, blockIndex, { [field]: value });
    },
    [actions, slideIndex, blockIndex]
  );

  // Wrapper for adding validation feedback and focus ring
  const withValidation = (content: React.ReactNode, showCharCounter = true) => {
    const hasViolations = validation.violations.length > 0;

    return (
      <div
        className={`relative transition-all duration-200 rounded-lg ${
          isEditing
            ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent"
            : "hover:ring-2 hover:ring-emerald-600/20 hover:ring-offset-1 hover:ring-offset-transparent"
        }`}
      >
        {content}
        {/* Character counter shown when editing or approaching limit */}
        {showCounter && showCharCounter && (isEditing || validation.isApproaching) && (
          <div className="mt-1 flex items-center justify-end">
            <CharacterCounter
              current={validation.current}
              max={validation.max}
              compact={!isEditing}
            />
          </div>
        )}
        {/* Overflow warning shown when exceeding limits */}
        {hasViolations && !isEditing && (
          <CompactOverflowWarning
            message={validation.violations[0].message}
            severity="error"
            className="mt-1"
          />
        )}
      </div>
    );
  };

  switch (block.kind) {
    case "title":
      return withValidation(
        <TitleBlock
          text={block.text ?? ""}
          level={titleLevel}
          className={className}
          isEditing={isEditing}
          onTextChange={handleTextChange}
          onBlur={handleBlur}
          onClick={handleClick}
        />
      );

    case "text":
      return withValidation(
        <TextBlock
          text={block.text ?? ""}
          className={className}
          isEditing={isEditing}
          onTextChange={handleTextChange}
          onBlur={handleBlur}
          onClick={handleClick}
        />
      );

    case "bullets":
      return (
        <div
          className={`relative transition-all duration-200 rounded-lg ${
            isEditing
              ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent"
              : "hover:ring-2 hover:ring-emerald-600/20 hover:ring-offset-1 hover:ring-offset-transparent"
          }`}
        >
          <BulletsBlock
            items={block.items ?? []}
            className={className}
            isEditing={isEditing}
            onItemsChange={handleItemsChange}
            onBlur={handleBlur}
            onClick={handleClick}
          />
          {/* Item counter for bullets */}
          {showCounter && (isEditing || validation.isApproaching) && (
            <div className="mt-1 flex items-center justify-end">
              <ItemCounter current={(block.items ?? []).length} max={validation.max} />
            </div>
          )}
          {validation.violations.length > 0 && !isEditing && (
            <CompactOverflowWarning
              message={validation.violations[0].message}
              severity="error"
              className="mt-1"
            />
          )}
        </div>
      );

    case "image":
      // Image blocks are read-only in MVP
      return (
        <ImageBlock
          url={block.url ?? ""}
          alt={block.alt ?? ""}
          cropMode={block.cropMode}
          className={className}
        />
      );

    case "table":
      return (
        <div
          className={`relative transition-all duration-200 rounded-lg ${
            isEditing
              ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent"
              : "hover:ring-2 hover:ring-emerald-600/20 hover:ring-offset-1 hover:ring-offset-transparent"
          }`}
        >
          <TableBlock
            columns={block.columns ?? []}
            rows={block.rows ?? []}
            className={className}
            isEditing={isEditing}
            onColumnsChange={handleColumnsChange}
            onRowsChange={handleRowsChange}
            onBlur={handleBlur}
            onClick={handleClick}
          />
          {/* Row counter for tables */}
          {showCounter && (isEditing || validation.isApproaching) && (
            <div className="mt-1 flex items-center justify-end text-xs text-zinc-500">
              {(block.rows ?? []).length}/{validation.max} rader
            </div>
          )}
          {validation.violations.length > 0 && !isEditing && (
            <CompactOverflowWarning
              message={validation.violations[0].message}
              severity="error"
              className="mt-1"
            />
          )}
        </div>
      );

    case "callout":
      return withValidation(
        <CalloutBlock
          text={block.text ?? ""}
          style={block.style}
          className={className}
          isEditing={isEditing}
          onTextChange={handleTextChange}
          onBlur={handleBlur}
          onClick={handleClick}
        />
      );

    // Phase 7: Editable stat_block
    case "stat_block":
      return (
        <div
          className={`relative transition-all duration-200 rounded-lg ${
            isEditing
              ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent"
              : "hover:ring-2 hover:ring-emerald-600/20 hover:ring-offset-1 hover:ring-offset-transparent"
          }`}
        >
          <EditableStatBlock
            value={block.value ?? ""}
            label={block.label ?? ""}
            sublabel={block.sublabel}
            className={className}
            isEditing={isEditing}
            onFieldChange={handleStatFieldChange}
            onBlur={handleBlur}
            onClick={handleClick}
          />
          {validation.violations.length > 0 && !isEditing && (
            <CompactOverflowWarning
              message={validation.violations[0].message}
              severity="error"
              className="mt-1"
            />
          )}
        </div>
      );

    // Phase 7: Editable timeline_step
    case "timeline_step":
      return (
        <div
          className={`relative transition-all duration-200 rounded-lg ${
            isEditing
              ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent"
              : "hover:ring-2 hover:ring-emerald-600/20 hover:ring-offset-1 hover:ring-offset-transparent"
          }`}
        >
          <EditableTimelineStepBlock
            step={block.step ?? 1}
            title={block.text ?? ""}
            description={block.description}
            status={block.status}
            className={className}
            isEditing={isEditing}
            onFieldChange={handleTimelineFieldChange}
            onBlur={handleBlur}
            onClick={handleClick}
          />
          {validation.violations.length > 0 && !isEditing && (
            <CompactOverflowWarning
              message={validation.violations[0].message}
              severity="error"
              className="mt-1"
            />
          )}
        </div>
      );

    // Phase 7: Editable icon_card
    case "icon_card":
      return (
        <div
          className={`relative transition-all duration-200 rounded-lg ${
            isEditing
              ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent"
              : "hover:ring-2 hover:ring-emerald-600/20 hover:ring-offset-1 hover:ring-offset-transparent"
          }`}
        >
          <EditableIconCardBlock
            icon={block.icon ?? "circle"}
            text={block.text ?? ""}
            description={block.description}
            bgColor={block.bgColor}
            className={className}
            isEditing={isEditing}
            onFieldChange={handleIconCardFieldChange}
            onBlur={handleBlur}
            onClick={handleClick}
          />
          {validation.violations.length > 0 && !isEditing && (
            <CompactOverflowWarning
              message={validation.violations[0].message}
              severity="error"
              className="mt-1"
            />
          )}
        </div>
      );

    // Phase 7: Editable numbered_card
    case "numbered_card":
      return (
        <div
          className={`relative transition-all duration-200 rounded-lg ${
            isEditing
              ? "ring-2 ring-emerald-600 ring-offset-2 ring-offset-transparent"
              : "hover:ring-2 hover:ring-emerald-600/20 hover:ring-offset-1 hover:ring-offset-transparent"
          }`}
        >
          <EditableNumberedCardBlock
            number={block.number ?? 1}
            text={block.text ?? ""}
            description={block.description}
            className={className}
            isEditing={isEditing}
            onFieldChange={handleNumberedCardFieldChange}
            onBlur={handleBlur}
            onClick={handleClick}
          />
          {validation.violations.length > 0 && !isEditing && (
            <CompactOverflowWarning
              message={validation.violations[0].message}
              severity="error"
              className="mt-1"
            />
          )}
        </div>
      );

    default:
      console.warn(`Unknown block kind: ${(block as Block).kind}`);
      return (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
          Unknown block type: {(block as Block).kind}
        </div>
      );
  }
}

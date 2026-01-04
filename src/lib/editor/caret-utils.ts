/**
 * Caret Position Utilities
 *
 * Functions for working with caret (cursor) position in contentEditable elements.
 * Used by SlashMenu to position the menu near the caret.
 */

// ============================================================================
// Types
// ============================================================================

export interface CaretPosition {
  /** X coordinate relative to viewport */
  x: number;
  /** Y coordinate relative to viewport (bottom of caret) */
  y: number;
  /** Height of the caret/line */
  height: number;
}

export interface CaretRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

// ============================================================================
// Get Caret Position
// ============================================================================

/**
 * Get the current caret position in the viewport.
 * Works with contentEditable elements.
 *
 * @returns Caret position or null if no selection
 */
export function getCaretPosition(): CaretPosition | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  // For collapsed selections (just a caret), get the bounding rect
  if (range.collapsed) {
    // Create a temporary span to get accurate position
    const span = document.createElement("span");
    span.textContent = "\u200B"; // Zero-width space

    try {
      range.insertNode(span);
      const rect = span.getBoundingClientRect();

      // Remove the temporary span
      const parent = span.parentNode;
      if (parent) {
        parent.removeChild(span);
        // Normalize to merge adjacent text nodes
        parent.normalize();
      }

      return {
        x: rect.left,
        y: rect.bottom,
        height: rect.height,
      };
    } catch {
      // Fallback if insertion fails
      const rect = range.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.bottom,
        height: rect.height || 20, // Default line height
      };
    }
  }

  // For non-collapsed selections, use the range bounds
  const rect = range.getBoundingClientRect();
  return {
    x: rect.right,
    y: rect.bottom,
    height: rect.height,
  };
}

/**
 * Get the full bounding rect of the current caret/selection.
 */
export function getCaretRect(): CaretRect | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height,
  };
}

// ============================================================================
// Text Manipulation
// ============================================================================

/**
 * Get the text content before the caret in the current selection.
 */
export function getTextBeforeCaret(): string | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!range.collapsed) {
    return null;
  }

  // Get the text node and offset
  const node = range.startContainer;
  const offset = range.startOffset;

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.slice(0, offset) ?? null;
  }

  return null;
}

/**
 * Check if the caret is at the end of a slash command trigger.
 * Returns the text after the last "/" if found, otherwise null.
 */
export function getSlashTriggerText(): string | null {
  const textBefore = getTextBeforeCaret();
  if (textBefore === null) {
    return null;
  }

  // Find the last "/" in the text
  const lastSlashIndex = textBefore.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return null;
  }

  // Check if "/" is at the start or after whitespace
  if (lastSlashIndex > 0) {
    const charBefore = textBefore[lastSlashIndex - 1];
    if (!/\s/.test(charBefore)) {
      return null; // "/" is not at word boundary
    }
  }

  // Return text after the "/"
  return textBefore.slice(lastSlashIndex + 1);
}

/**
 * Delete characters before the caret.
 *
 * @param count Number of characters to delete
 */
export function deleteBeforeCaret(count: number): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);
  if (!range.collapsed) {
    return false;
  }

  const node = range.startContainer;
  const offset = range.startOffset;

  if (node.nodeType !== Node.TEXT_NODE || offset < count) {
    return false;
  }

  // Delete the characters
  const textNode = node as Text;
  textNode.deleteData(offset - count, count);

  // Move caret to new position
  range.setStart(node, offset - count);
  range.setEnd(node, offset - count);
  selection.removeAllRanges();
  selection.addRange(range);

  return true;
}

/**
 * Delete the slash command trigger (/ plus any text typed after it).
 */
export function deleteSlashTrigger(): boolean {
  const textBefore = getTextBeforeCaret();
  if (textBefore === null) {
    return false;
  }

  const lastSlashIndex = textBefore.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return false;
  }

  // Check if "/" is at the start or after whitespace
  if (lastSlashIndex > 0) {
    const charBefore = textBefore[lastSlashIndex - 1];
    if (!/\s/.test(charBefore)) {
      return false;
    }
  }

  // Delete from "/" to caret
  const charsToDelete = textBefore.length - lastSlashIndex;
  return deleteBeforeCaret(charsToDelete);
}

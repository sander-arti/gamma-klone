"use client";

/**
 * TableBlock Component
 *
 * Renders a table with header row and data rows.
 * Supports cell-level inline editing when isEditing is true.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { BLOCK_CONSTRAINTS } from "@/lib/editor/constraints";

interface TableBlockProps {
  columns: string[];
  rows: string[][];
  className?: string;
  /** Enable inline editing mode */
  isEditing?: boolean;
  /** Callback when columns change */
  onColumnsChange?: (columns: string[]) => void;
  /** Callback when rows change */
  onRowsChange?: (rows: string[][]) => void;
  /** Callback when editing ends (blur) */
  onBlur?: () => void;
  /** Callback when block is clicked (to start editing) */
  onClick?: () => void;
}

type CellPosition = {
  type: "header" | "cell";
  row: number;
  col: number;
};

export function TableBlock({
  columns,
  rows,
  className = "",
  isEditing = false,
  onColumnsChange,
  onRowsChange,
  onBlur,
  onClick,
}: TableBlockProps) {
  // Cell refs: headers[col] and cells[row][col]
  const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);

  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);

  const { maxColumns, maxRows } = BLOCK_CONSTRAINTS.table;

  // Initialize cell refs array
  useEffect(() => {
    cellRefs.current = rows.map(() => []);
  }, [rows.length]);

  // Focus the editing cell
  useEffect(() => {
    if (isEditing && editingCell) {
      let el: HTMLTableCellElement | null = null;
      if (editingCell.type === "header") {
        el = headerRefs.current[editingCell.col];
      } else {
        el = cellRefs.current[editingCell.row]?.[editingCell.col];
      }
      if (el) {
        el.focus();
        // Select all text
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isEditing, editingCell]);

  // Handle header input
  const handleHeaderInput = useCallback(
    (colIndex: number) => {
      const el = headerRefs.current[colIndex];
      if (el && onColumnsChange) {
        const newText = el.textContent ?? "";
        const newColumns = [...columns];
        newColumns[colIndex] = newText;
        onColumnsChange(newColumns);
      }
    },
    [columns, onColumnsChange]
  );

  // Handle cell input
  const handleCellInput = useCallback(
    (rowIndex: number, colIndex: number) => {
      const el = cellRefs.current[rowIndex]?.[colIndex];
      if (el && onRowsChange) {
        const newText = el.textContent ?? "";
        const newRows = rows.map((row, ri) =>
          ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? newText : cell)) : [...row]
        );
        onRowsChange(newRows);
      }
    },
    [rows, onRowsChange]
  );

  // Handle blur
  const handleCellBlur = useCallback(() => {
    // Small delay to allow for cell-to-cell focus transitions
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isStillInTable =
        headerRefs.current.some((ref) => ref === activeElement) ||
        cellRefs.current.some((row) => row?.some((ref) => ref === activeElement));

      if (!isStillInTable) {
        setEditingCell(null);
        onBlur?.();
      }
    }, 50);
  }, [onBlur]);

  // Handle cell click
  const handleCellClick = useCallback(
    (position: CellPosition) => {
      if (isEditing) {
        setEditingCell(position);
      } else if (onClick) {
        onClick();
      }
    },
    [isEditing, onClick]
  );

  // Handle key navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, position: CellPosition) => {
      const { type, row, col } = position;

      // Tab: Move to next cell
      if (e.key === "Tab") {
        e.preventDefault();
        let nextCol = col + (e.shiftKey ? -1 : 1);
        let nextRow = row;
        let nextType: "header" | "cell" = type;

        // Handle column overflow
        if (nextCol >= columns.length) {
          nextCol = 0;
          if (type === "header") {
            nextType = "cell";
            nextRow = 0;
          } else {
            nextRow++;
            if (nextRow >= rows.length) {
              // Stay at last cell
              nextRow = rows.length - 1;
              nextCol = columns.length - 1;
            }
          }
        } else if (nextCol < 0) {
          nextCol = columns.length - 1;
          if (type === "cell") {
            nextRow--;
            if (nextRow < 0) {
              nextType = "header";
              nextRow = 0;
            }
          }
        }

        setEditingCell({ type: nextType, row: nextRow, col: nextCol });
      }

      // Arrow keys
      if (e.key === "ArrowRight" && col < columns.length - 1) {
        e.preventDefault();
        setEditingCell({ ...position, col: col + 1 });
      }
      if (e.key === "ArrowLeft" && col > 0) {
        e.preventDefault();
        setEditingCell({ ...position, col: col - 1 });
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (type === "header") {
          if (rows.length > 0) {
            setEditingCell({ type: "cell", row: 0, col });
          }
        } else if (row < rows.length - 1) {
          setEditingCell({ ...position, row: row + 1 });
        }
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (type === "cell") {
          if (row > 0) {
            setEditingCell({ ...position, row: row - 1 });
          } else {
            setEditingCell({ type: "header", row: 0, col });
          }
        }
      }

      // Enter: Move to cell below or add row
      if (e.key === "Enter") {
        e.preventDefault();
        if (type === "header") {
          if (rows.length > 0) {
            setEditingCell({ type: "cell", row: 0, col });
          }
        } else if (row < rows.length - 1) {
          setEditingCell({ ...position, row: row + 1 });
        }
      }
    },
    [columns.length, rows.length]
  );

  // Add column
  const addColumn = useCallback(() => {
    if (columns.length < maxColumns && onColumnsChange && onRowsChange) {
      const newColumns = [...columns, `Kolonne ${columns.length + 1}`];
      const newRows = rows.map((row) => [...row, ""]);
      onColumnsChange(newColumns);
      onRowsChange(newRows);
    }
  }, [columns, rows, maxColumns, onColumnsChange, onRowsChange]);

  // Add row
  const addRow = useCallback(() => {
    if (rows.length < maxRows && onRowsChange) {
      const newRows = [...rows, columns.map(() => "")];
      onRowsChange(newRows);
    }
  }, [columns, rows, maxRows, onRowsChange]);

  // Delete column
  const deleteColumn = useCallback(
    (colIndex: number) => {
      if (columns.length > 1 && onColumnsChange && onRowsChange) {
        const newColumns = columns.filter((_, i) => i !== colIndex);
        const newRows = rows.map((row) => row.filter((_, i) => i !== colIndex));
        onColumnsChange(newColumns);
        onRowsChange(newRows);
        setEditingCell(null);
      }
    },
    [columns, rows, onColumnsChange, onRowsChange]
  );

  // Delete row
  const deleteRow = useCallback(
    (rowIndex: number) => {
      if (rows.length > 1 && onRowsChange) {
        const newRows = rows.filter((_, i) => i !== rowIndex);
        onRowsChange(newRows);
        setEditingCell(null);
      }
    },
    [rows, onRowsChange]
  );

  const editingStyles = isEditing
    ? "ring-2 ring-blue-500 ring-offset-2 rounded"
    : onClick
      ? "cursor-text hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 rounded transition-all"
      : "";

  // Table container style with shadow and rounded corners
  const tableContainerStyle: React.CSSProperties = {
    borderRadius: "var(--theme-effects-border-radius, 0.75rem)",
    overflow: "hidden",
    boxShadow:
      "var(--theme-effects-box-shadow-small, 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04))",
    border: "1px solid var(--theme-color-border-subtle, #e2e8f0)",
  };

  // Inline styles for theme variables - use semantic spacing
  const cellStyle: React.CSSProperties = {
    padding: "var(--theme-spacing-sm, 0.5rem) var(--theme-spacing-md, 1rem)",
    fontSize: "var(--theme-typography-body-size, 0.9375rem)",
    lineHeight: "var(--theme-typography-body-line-height, 1.65)",
    color: "var(--theme-color-foreground, #0f172a)",
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: "var(--theme-color-background-muted, #f8fafc)",
    fontWeight:
      "var(--theme-typography-subheading-weight, 600)" as React.CSSProperties["fontWeight"],
    fontSize: "var(--theme-typography-caption-size, 0.8125rem)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--theme-typography-letter-spacing-wide, 0.05em)",
    color: "var(--theme-color-foreground-muted, #64748b)",
  };

  const headerRowStyle: React.CSSProperties = {
    borderBottom: "2px solid var(--theme-color-border, #e2e8f0)",
  };

  // Zebra striping - even rows have subtle background
  const getBodyRowStyle = (rowIndex: number): React.CSSProperties => ({
    borderBottom:
      rowIndex < rows.length - 1 ? "1px solid var(--theme-color-border-subtle, #f1f5f9)" : "none",
    backgroundColor:
      rowIndex % 2 === 1 ? "var(--theme-color-background-subtle, #fafafa)" : "transparent",
    transition: "background-color 0.15s ease",
  });

  return (
    <div className="relative animate-fade-in">
      <div
        className={`overflow-x-auto ${editingStyles} ${className}`}
        style={tableContainerStyle}
        onClick={!isEditing && onClick ? onClick : undefined}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr style={headerRowStyle}>
              {columns.map((column, colIndex) => {
                const isHeaderEditing =
                  isEditing && editingCell?.type === "header" && editingCell?.col === colIndex;

                return (
                  <th
                    key={colIndex}
                    ref={(el) => {
                      headerRefs.current[colIndex] = el;
                    }}
                    className={`text-left ${
                      isHeaderEditing
                        ? "outline-none ring-2 ring-inset ring-blue-400"
                        : isEditing
                          ? "cursor-text hover:bg-slate-100"
                          : ""
                    }`}
                    style={headerCellStyle}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onInput={() => handleHeaderInput(colIndex)}
                    onBlur={handleCellBlur}
                    onClick={() => handleCellClick({ type: "header", row: 0, col: colIndex })}
                    onKeyDown={
                      isEditing
                        ? (e) => handleKeyDown(e, { type: "header", row: 0, col: colIndex })
                        : undefined
                    }
                  >
                    {column}
                  </th>
                );
              })}
              {/* Delete column buttons when editing */}
              {isEditing && columns.length > 1 && (
                <th
                  className="p-1 w-8"
                  style={{ backgroundColor: "var(--theme-color-background-muted, #f8fafc)" }}
                >
                  {editingCell?.type === "header" && (
                    <button
                      type="button"
                      onClick={() => deleteColumn(editingCell.col)}
                      className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Slett kolonne"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-blue-50/50 transition-colors"
                style={getBodyRowStyle(rowIndex)}
              >
                {row.map((cell, cellIndex) => {
                  const isCellEditing =
                    isEditing &&
                    editingCell?.type === "cell" &&
                    editingCell?.row === rowIndex &&
                    editingCell?.col === cellIndex;

                  return (
                    <td
                      key={cellIndex}
                      ref={(el) => {
                        if (!cellRefs.current[rowIndex]) {
                          cellRefs.current[rowIndex] = [];
                        }
                        cellRefs.current[rowIndex][cellIndex] = el;
                      }}
                      className={`${
                        isCellEditing
                          ? "outline-none ring-2 ring-inset ring-blue-400"
                          : isEditing
                            ? "cursor-text hover:bg-blue-50"
                            : ""
                      }`}
                      style={cellStyle}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onInput={() => handleCellInput(rowIndex, cellIndex)}
                      onBlur={handleCellBlur}
                      onClick={() =>
                        handleCellClick({ type: "cell", row: rowIndex, col: cellIndex })
                      }
                      onKeyDown={
                        isEditing
                          ? (e) => handleKeyDown(e, { type: "cell", row: rowIndex, col: cellIndex })
                          : undefined
                      }
                    >
                      {cell}
                    </td>
                  );
                })}
                {/* Delete row button when editing */}
                {isEditing && rows.length > 1 && (
                  <td className="p-1 w-8">
                    {editingCell?.type === "cell" && editingCell?.row === rowIndex && (
                      <button
                        type="button"
                        onClick={() => deleteRow(rowIndex)}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Slett rad"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row/column buttons when editing */}
      {isEditing && (
        <div className="flex gap-2 mt-2">
          {rows.length < maxRows && (
            <button
              type="button"
              onClick={addRow}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Legg til rad
            </button>
          )}
          {columns.length < maxColumns && (
            <button
              type="button"
              onClick={addColumn}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Legg til kolonne
            </button>
          )}
        </div>
      )}

      {/* Size indicator when editing */}
      {isEditing && (
        <div className="absolute -bottom-5 right-0 text-xs text-gray-400">
          {columns.length}/{maxColumns} kolonner, {rows.length}/{maxRows} rader
        </div>
      )}
    </div>
  );
}

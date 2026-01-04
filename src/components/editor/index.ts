/**
 * Editor Components
 *
 * Components for the presentation editor.
 */

export { EditorProvider, useEditor, useCurrentSlide, useEditorDispatch } from "./EditorProvider";

export { EditorLayout } from "./EditorLayout";
export { SlideList } from "./SlideList";
export { Inspector } from "./Inspector";
export { CharacterCounter, CharacterProgressBar, ItemCounter } from "./CharacterCounter";
export { OverflowWarning, CompactOverflowWarning } from "./OverflowWarning";
export { AIActionsMenu } from "./AIActionsMenu";
export { ShareModal } from "./ShareModal";
export { ExportModal } from "./ExportModal";
export { SaveStatus } from "./SaveStatus";
export { SlideTransition } from "./SlideTransition";
export { CommandPalette } from "./CommandPalette";
export { SlashMenu, useSlashMenu, type SlashMenuItem } from "./SlashMenu";
export { AIChat, useAIChat, type AIChatProps } from "./AIChat";
export { HelpModal, type HelpModalProps } from "./HelpModal";

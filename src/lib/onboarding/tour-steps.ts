/**
 * Product tour steps for new user onboarding
 *
 * Defines the 3-step guided tour that helps new users understand the platform.
 */

export type TourStep = {
  id: string;
  title: string;
  description: string;
  target: string | 'modal'; // CSS selector or 'modal' for center position
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
};

/**
 * Dashboard onboarding tour steps (Norwegian)
 *
 * Step 1: Welcome modal (center)
 * Step 2: Sample deck highlight (right of deck list)
 * Step 3: Create new presentation button (bottom)
 */
export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Velkommen til ARTI Slides! 👋',
    description:
      'La oss vise deg rundt i 30 sekunder. Du kan hoppe over når som helst.',
    target: 'modal',
    position: 'center',
  },
  {
    id: 'sample-deck',
    title: 'Din første presentasjon',
    description:
      'Vi har laget en eksempel-presentasjon for deg. Åpne den for å se hva ARTI Slides kan gjøre.',
    target: '[data-tour="deck-list"]',
    position: 'right',
  },
  {
    id: 'create-new',
    title: 'Lag din egen',
    description:
      'Klar til å lage din første presentasjon? Klikk her for å starte med AI-generering.',
    target: '[data-tour="new-presentation"]',
    position: 'bottom',
  },
];

/**
 * Get tour step by ID
 */
export function getTourStep(id: string): TourStep | undefined {
  return DASHBOARD_TOUR_STEPS.find((step) => step.id === id);
}

/**
 * Get total number of tour steps
 */
export function getTourStepCount(): number {
  return DASHBOARD_TOUR_STEPS.length;
}

/**
 * Check if a step ID is valid
 */
export function isValidTourStepId(id: string): boolean {
  return DASHBOARD_TOUR_STEPS.some((step) => step.id === id);
}

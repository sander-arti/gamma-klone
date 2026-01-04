/**
 * Analytics Event Tracking
 *
 * Centralized analytics event definitions and tracking.
 * Currently logs to console (MVP). Replace with actual analytics service (PostHog, Mixpanel, etc.)
 */

/**
 * Onboarding-related events
 */
export type OnboardingEvent =
  | "onboarding_tour_started"
  | "onboarding_tour_completed"
  | "onboarding_tour_skipped"
  | "onboarding_tour_step_viewed"
  | "sample_deck_opened"
  | "sample_deck_created";

/**
 * Editor-related events
 */
export type EditorEvent = "help_modal_opened" | "command_palette_opened";

/**
 * All analytics events
 */
export type AnalyticsEvent = OnboardingEvent | EditorEvent;

/**
 * Event properties
 */
export type EventProperties = Record<string, string | number | boolean | null>;

/**
 * Track an analytics event
 *
 * @param event - Event name
 * @param properties - Optional event properties
 *
 * @example
 * track('onboarding_tour_started');
 * track('onboarding_tour_step_viewed', { step: 'welcome', stepIndex: 0 });
 */
export function track(event: AnalyticsEvent, properties?: EventProperties): void {
  // MVP: Log to console
  // TODO: Replace with actual analytics service (PostHog, Mixpanel, etc.)

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event, properties || {});
  }

  // Future implementation example:
  // if (typeof window !== 'undefined' && window.analytics) {
  //   window.analytics.track(event, properties);
  // }
}

/**
 * Identify a user
 *
 * @param userId - User ID
 * @param traits - Optional user traits
 *
 * @example
 * identify('user-123', { email: 'user@example.com', plan: 'free' });
 */
export function identify(userId: string, traits?: EventProperties): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] Identify:", userId, traits || {});
  }

  // Future implementation example:
  // if (typeof window !== 'undefined' && window.analytics) {
  //   window.analytics.identify(userId, traits);
  // }
}

/**
 * Track a page view
 *
 * @param pageName - Page name
 * @param properties - Optional page properties
 *
 * @example
 * page('Dashboard', { workspace: 'workspace-123' });
 */
export function page(pageName: string, properties?: EventProperties): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] Page:", pageName, properties || {});
  }

  // Future implementation example:
  // if (typeof window !== 'undefined' && window.analytics) {
  //   window.analytics.page(pageName, properties);
  // }
}

/**
 * Onboarding-specific tracking helpers
 */
export const onboarding = {
  /**
   * Track tour started
   */
  tourStarted(): void {
    track("onboarding_tour_started", {
      timestamp: Date.now(),
    });
  },

  /**
   * Track tour step viewed
   */
  tourStepViewed(stepId: string, stepIndex: number): void {
    track("onboarding_tour_step_viewed", {
      step: stepId,
      stepIndex,
      timestamp: Date.now(),
    });
  },

  /**
   * Track tour completed
   */
  tourCompleted(stepsViewed: number): void {
    track("onboarding_tour_completed", {
      stepsViewed,
      timestamp: Date.now(),
    });
  },

  /**
   * Track tour skipped
   */
  tourSkipped(currentStep: number, totalSteps: number): void {
    track("onboarding_tour_skipped", {
      currentStep,
      totalSteps,
      timestamp: Date.now(),
    });
  },

  /**
   * Track sample deck opened
   */
  sampleDeckOpened(deckId: string): void {
    track("sample_deck_opened", {
      deckId,
      timestamp: Date.now(),
    });
  },

  /**
   * Track sample deck created
   */
  sampleDeckCreated(deckId: string, userId: string): void {
    track("sample_deck_created", {
      deckId,
      userId,
      timestamp: Date.now(),
    });
  },
};

/**
 * Editor-specific tracking helpers
 */
export const editor = {
  /**
   * Track help modal opened
   */
  helpModalOpened(): void {
    track("help_modal_opened", {
      timestamp: Date.now(),
    });
  },

  /**
   * Track command palette opened
   */
  commandPaletteOpened(): void {
    track("command_palette_opened", {
      timestamp: Date.now(),
    });
  },
};

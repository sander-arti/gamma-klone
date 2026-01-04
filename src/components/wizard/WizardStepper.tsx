"use client";

/**
 * WizardStepper
 *
 * Visual step indicator for the presentation wizard.
 */

interface Step {
  id: string;
  title: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <nav className="flex items-center justify-center space-x-4" aria-label="Progress">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                ${
                  isCompleted
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : isCurrent
                      ? "border-emerald-600 text-emerald-600 bg-white"
                      : "border-gray-300 text-gray-400 bg-white"
                }
              `}
            >
              {isCompleted ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>

            {/* Step label */}
            <span
              className={`ml-2 text-sm font-medium ${
                isCurrent ? "text-emerald-600" : isCompleted ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {step.title}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 ml-4 ${
                  index < currentStep ? "bg-emerald-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

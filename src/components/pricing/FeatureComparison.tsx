/**
 * FeatureComparison Component
 *
 * Detailed feature comparison table across all pricing tiers.
 */

"use client";

interface FeatureRow {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  team: string | boolean;
  enterprise: string | boolean;
}

const features: FeatureRow[] = [
  {
    feature: "Presentasjoner per maned",
    free: "3",
    pro: "Ubegrenset",
    team: "Ubegrenset",
    enterprise: "Ubegrenset",
  },
  {
    feature: "Slide-typer",
    free: "Grunnleggende",
    pro: "Alle 20+",
    team: "Alle 20+",
    enterprise: "Alle 20+",
  },
  {
    feature: "Designtemaer",
    free: "2",
    pro: "Alle 6",
    team: "Alle 6 + custom",
    enterprise: "Ubegrenset",
  },
  {
    feature: "PDF-eksport",
    free: true,
    pro: true,
    team: true,
    enterprise: true,
  },
  {
    feature: "PPTX-eksport (redigerbar)",
    free: false,
    pro: true,
    team: true,
    enterprise: true,
  },
  {
    feature: "AI-genererte bilder",
    free: false,
    pro: true,
    team: true,
    enterprise: true,
  },
  {
    feature: "Fjern vannmerke",
    free: false,
    pro: true,
    team: true,
    enterprise: true,
  },
  {
    feature: "Brand Kit",
    free: false,
    pro: false,
    team: true,
    enterprise: true,
  },
  {
    feature: "Teammedlemmer",
    free: "1",
    pro: "1",
    team: "5",
    enterprise: "Ubegrenset",
  },
  {
    feature: "Delt bibliotek",
    free: false,
    pro: false,
    team: true,
    enterprise: true,
  },
  {
    feature: "API-tilgang",
    free: false,
    pro: false,
    team: false,
    enterprise: true,
  },
  {
    feature: "SSO",
    free: false,
    pro: false,
    team: false,
    enterprise: true,
  },
  {
    feature: "Dedikert support",
    free: false,
    pro: false,
    team: false,
    enterprise: true,
  },
];

function renderCell(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? (
      <svg
        className="w-5 h-5 text-emerald-500 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg
        className="w-5 h-5 text-gray-300 mx-auto"
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
    );
  }
  return <span className="text-sm text-gray-700">{value}</span>;
}

export function FeatureComparison() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 font-semibold text-gray-900">Funksjon</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-900">Gratis</th>
            <th className="text-center py-4 px-4 font-semibold text-emerald-600">Pro</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-900">Team</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {features.map((row, index) => (
            <tr
              key={index}
              className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-gray-50/50" : ""}`}
            >
              <td className="py-4 px-4 text-sm text-gray-700">{row.feature}</td>
              <td className="py-4 px-4 text-center">{renderCell(row.free)}</td>
              <td className="py-4 px-4 text-center bg-emerald-50/30">{renderCell(row.pro)}</td>
              <td className="py-4 px-4 text-center">{renderCell(row.team)}</td>
              <td className="py-4 px-4 text-center">{renderCell(row.enterprise)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

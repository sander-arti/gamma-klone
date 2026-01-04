/**
 * PricingCard Component
 *
 * Individual pricing tier card with features list.
 * Supports highlighted/popular variant.
 */

"use client";

import Link from "next/link";

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  enterprise?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
}

export function PricingCard({ tier }: PricingCardProps) {
  const isPopular = tier.popular;
  const isEnterprise = tier.enterprise;

  return (
    <div
      className={`
        relative rounded-2xl p-8
        ${
          isPopular
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/25 scale-105 z-10"
            : "bg-white border border-gray-200/80 shadow-sm"
        }
        transition-all duration-300
        hover:shadow-lg
      `}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1.5 rounded-full bg-white text-emerald-600 text-sm font-semibold shadow-lg">
            Mest populaer
          </div>
        </div>
      )}

      {/* Plan name */}
      <h3
        className={`text-xl font-semibold mb-2 ${
          isPopular ? "text-white" : "text-gray-900"
        }`}
      >
        {tier.name}
      </h3>

      {/* Price */}
      <div className="mb-4">
        {isEnterprise ? (
          <div
            className={`text-3xl font-bold ${
              isPopular ? "text-white" : "text-gray-900"
            }`}
          >
            Kontakt oss
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span
              className={`text-4xl font-bold ${
                isPopular ? "text-white" : "text-gray-900"
              }`}
            >
              {tier.price}
            </span>
            <span
              className={`text-lg ${
                isPopular ? "text-emerald-100" : "text-gray-500"
              }`}
            >
              {tier.period}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p
        className={`text-sm mb-6 ${
          isPopular ? "text-emerald-100" : "text-gray-600"
        }`}
      >
        {tier.description}
      </p>

      {/* CTA Button */}
      <Link
        href={tier.ctaHref}
        className={`
          block w-full py-3 px-4 rounded-xl
          text-center font-semibold
          transition-all duration-200
          ${
            isPopular
              ? "bg-white text-emerald-600 hover:bg-emerald-50"
              : isEnterprise
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
          }
        `}
      >
        {tier.cta}
      </Link>

      {/* Features list */}
      <ul className="mt-8 space-y-3">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                isPopular ? "text-emerald-200" : "text-emerald-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span
              className={`text-sm ${
                isPopular ? "text-emerald-50" : "text-gray-600"
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

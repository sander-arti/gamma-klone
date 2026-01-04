/**
 * Testimonials Component
 *
 * Displays customer testimonials in å premium card layout.
 * Placeholder testimonials - replace with real ones.
 */

"use client";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Endelig slipper jeg å bruke timer på å rydde opp i AI-genererte slides. ARTI Slides gir meg presentasjoner jeg faktisk kan bruke.",
    name: "Maria Olsen",
    role: "Konsulent",
    company: "McKinney & Partners",
  },
  {
    quote:
      "Kollegaene trodde jeg hadde brukt en designer. Det tok meg 2 minutter å lage en pitch deck som tidligere ville tatt en hel dag.",
    name: "Erik Hansen",
    role: "Salgssjef",
    company: "TechNordic AS",
  },
  {
    quote:
      "Fra møtenotater til ferdig styrepresentasjon på under 5 minutter. Dette har endret hvordan vi jobber.",
    name: "Ingrid Berg",
    role: "CEO",
    company: "GreenStart",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 mb-6">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
            <span className="text-sm font-medium text-emerald-700">Fra vare kunder</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Brukt av team som verdsetter kvalitet
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Se hva andre sier om å bruke ARTI Slides.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="
                relative
                bg-white rounded-2xl p-8
                border border-gray-200/80
                shadow-sm
                transition-all duration-300
                hover:shadow-lg hover:shadow-emerald-500/[0.08]
                hover:border-emerald-200/60
              "
            >
              {/* Quote mark */}
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                </div>
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6 mt-2">"{testimonial.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Bli med over 500+ profesjonelle som allerede bruker ARTI Slides
          </p>
        </div>
      </div>
    </section>
  );
}

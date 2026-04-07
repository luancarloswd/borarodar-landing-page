"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";

const avatarColors = [
  "from-forest to-forest-light",
  "from-khaki to-khaki-light",
  "from-forest-dark to-forest",
];

export default function Testimonials() {
  const t = useTranslations("testimonials");

  const items = t.raw("items") as Array<{
    name: string;
    city: string;
    quote: string;
  }>;

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("title")}
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-surface-alt hover:shadow-md transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4 text-khaki"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-primary text-sm leading-relaxed mb-6 italic">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${avatarColors[index % 3]} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-text-primary">
                    {item.name}
                  </p>
                  <p className="text-xs text-text-secondary">{item.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import AnimatedSection from "@/components/ui/AnimatedSection";

const waitlistSchema = z.object({
  name: z.string().min(2, "Min 2 characters"),
  email: z.string().email("Invalid email"),
  city: z.string().optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistResult {
  position: number;
  referralCode: string;
  referralCount: number;
  duplicate?: boolean;
}

export default function WaitlistCTA() {
  const t = useTranslations("waitlist");
  const locale = useLocale();
  const [result, setResult] = useState<WaitlistResult | null>(null);
  const [count, setCount] = useState<number>(1247);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((data) => {
        if (data.count) setCount(data.count);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(data: WaitlistFormData) {
    setSubmitting(true);
    try {
      // Get referral from URL if present
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          locale,
          ref: ref || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResult(result);
        setCount((prev) => (result.duplicate ? prev : prev + 1));
      }
    } catch (error) {
      console.error("Waitlist submission error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function copyReferralLink() {
    if (!result) return;
    const link = `${window.location.origin}/${locale}?ref=${result.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!result) return;
    const link = `${window.location.origin}/${locale}?ref=${result.referralCode}`;
    const text = encodeURIComponent(
      `Entrei na waitlist do Bora Rodar! Use meu link: ${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <section
      id="waitlist"
      className="py-24 relative overflow-hidden"
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* Decorative */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-10">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sand-light mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("title")}
          </h2>
          <p className="text-sand/80 text-lg">{t("subtitle")}</p>
        </AnimatedSection>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
              >
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sand-light text-sm font-medium mb-1.5">
                      {t("name")}
                    </label>
                    <input
                      {...register("name")}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sand-light placeholder:text-sand/40 focus:outline-none focus:ring-2 focus:ring-khaki/50 transition-all"
                      placeholder="Joao Silva"
                    />
                    {errors.name && (
                      <p className="text-red-300 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sand-light text-sm font-medium mb-1.5">
                      {t("email")}
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sand-light placeholder:text-sand/40 focus:outline-none focus:ring-2 focus:ring-khaki/50 transition-all"
                      placeholder="joao@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-300 text-xs mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sand-light text-sm font-medium mb-1.5">
                      {t("city")}
                    </label>
                    <input
                      {...register("city")}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sand-light placeholder:text-sand/40 focus:outline-none focus:ring-2 focus:ring-khaki/50 transition-all"
                      placeholder="Sao Paulo"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-6"
                  disabled={submitting}
                >
                  {submitting ? "..." : t("submit")}
                </Button>

                <p className="text-center text-sand/50 text-xs mt-4">
                  {t("privacy")}
                </p>

                {/* Count */}
                <div className="text-center mt-6 pt-6 border-t border-white/10">
                  <p className="text-sand-light">
                    <span className="text-2xl font-bold">{count.toLocaleString()}+</span>
                    <span className="text-sand/70 text-sm ml-2">{t("count")}</span>
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center"
            >
              {/* Celebration */}
              <div className="text-6xl mb-4">&#x1F389;</div>

              <h3 className="text-2xl font-bold text-sand-light mb-2">
                {t("success.title").replace("{position}", String(result.position))}
              </h3>

              <p className="text-sand/70 mb-8">{t("success.subtitle")}</p>

              {/* Share */}
              <div className="space-y-4">
                <p className="text-sand-light font-medium">{t("success.share")}</p>

                <div className="flex gap-3 justify-center">
                  {/* WhatsApp */}
                  <button
                    onClick={shareWhatsApp}
                    className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={copyReferralLink}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-sand-light px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {copied ? t("success.copied") : t("success.copy")}
                  </button>
                </div>

                <p className="text-sand/50 text-sm mt-6">{t("success.each")}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

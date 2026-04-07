import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import FeaturesGrid from "@/components/sections/FeaturesGrid";
import FeatureDeepDive from "@/components/sections/FeatureDeepDive";
import WaitlistCTA from "@/components/sections/WaitlistCTA";

type Props = {
  params: { locale: string } | Promise<{ locale: string }>;
};

export default async function FeaturesPage({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  setRequestLocale(locale);

  return <FeaturesPageContent />;
}

function FeaturesPageContent() {
  const t = useTranslations("features_page");

  return (
    <>
      <section className="pt-32 pb-16" style={{ background: "var(--hero-gradient)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-sand-light mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("title")}
          </h1>
          <p className="text-sand/80 text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
      </section>
      <FeaturesGrid />
      <FeatureDeepDive />
      <WaitlistCTA />
    </>
  );
}

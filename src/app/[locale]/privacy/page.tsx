import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string } | Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  setRequestLocale(locale);

  return <PrivacyPageContent />;
}

function PrivacyPageContent() {
  const t = useTranslations("privacy_page");

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
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-surface-alt prose prose-gray max-w-none">
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              {t("content")}
            </p>

            <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">
              1. Data Collection
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We collect only the information necessary to provide our services: name, email address, and optionally your city. This data is used exclusively for waitlist management and communication about the Bora Rodar app.
            </p>

            <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">
              2. Data Usage
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Your personal information will be used to: manage your position on the waitlist, send updates about the app launch, and provide customer support. We will never sell your data to third parties.
            </p>

            <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">
              3. Data Protection
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">
              4. Contact
            </h2>
            <p className="text-text-secondary leading-relaxed">
              For questions about this privacy policy, contact us at{" "}
              <a href="mailto:privacy@borarodar.app" className="text-forest hover:underline">
                privacy@borarodar.app
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

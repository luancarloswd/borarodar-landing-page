import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string } | Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  setRequestLocale(locale);

  return <TermsPageContent />;
}

function TermsPageContent() {
  const t = useTranslations("terms_page");

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
              1. Acceptance of Terms
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              By accessing and using Bora Rodar, you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use our services.
            </p>

            <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">
              2. Services
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Bora Rodar provides a motorcycle companion platform including ride tracking, route planning, badge collection, maintenance management, and community features. Features may vary by subscription plan.
            </p>

            <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">
              3. User Responsibilities
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Users are responsible for maintaining the confidentiality of their account credentials and for all activities under their account. Always prioritize road safety over app usage.
            </p>

            <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">
              4. Intellectual Property
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              All content, features, and functionality of Bora Rodar are owned by us and are protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">
              5. Contact
            </h2>
            <p className="text-text-secondary leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@borarodar.app" className="text-forest hover:underline">
                legal@borarodar.app
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

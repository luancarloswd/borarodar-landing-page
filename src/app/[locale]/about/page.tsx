import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string } | Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  setRequestLocale(locale);

  return <AboutPageContent />;
}

function AboutPageContent() {
  const t = useTranslations("about");

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
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-surface-alt">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl">&#x1F3CD;&#xFE0F;</span>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Bora Rodar</h2>
                <p className="text-text-secondary">Since 2026</p>
              </div>
            </div>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              {t("content")}
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-surface rounded-xl">
                <div className="text-3xl font-extrabold text-forest mb-1">5+</div>
                <div className="text-text-secondary text-sm">Team members</div>
              </div>
              <div className="text-center p-6 bg-surface rounded-xl">
                <div className="text-3xl font-extrabold text-forest mb-1">1200+</div>
                <div className="text-text-secondary text-sm">Waitlist riders</div>
              </div>
              <div className="text-center p-6 bg-surface rounded-xl">
                <div className="text-3xl font-extrabold text-forest mb-1">2026</div>
                <div className="text-text-secondary text-sm">Launch year</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: { locale: string } | Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: { locale: string } | Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = props.params instanceof Promise ? await props.params : props.params;
  const { locale } = resolvedParams;
  const messages = await getMessages({ locale });
  const meta = (messages as Record<string, Record<string, string>>).meta;

  return {
    title: meta?.title || "Bora Rodar",
    description: meta?.description || "",
    openGraph: {
      title: meta?.ogTitle || meta?.title || "Bora Rodar",
      description: meta?.ogDescription || meta?.description || "",
      type: "website",
      locale: locale === "pt-BR" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
      siteName: "Bora Rodar",
    },
    twitter: {
      card: "summary_large_image",
      title: meta?.ogTitle || meta?.title || "Bora Rodar",
      description: meta?.ogDescription || meta?.description || "",
    },
    alternates: {
      canonical: `https://borarodar.app/${locale}`,
      languages: {
        "pt-BR": "https://borarodar.app/pt-BR",
        en: "https://borarodar.app/en",
        es: "https://borarodar.app/es",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Bora Rodar",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "iOS, Android",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "BRL",
                  name: "Free",
                },
                {
                  "@type": "Offer",
                  price: "19",
                  priceCurrency: "BRL",
                  name: "Pro",
                },
              ],
              description:
                locale === "es"
                  ? "La app companera para motociclistas"
                  : locale === "en"
                    ? "The companion app for motorcycle riders"
                    : "O app companheiro para motociclistas",
              url: "https://borarodar.app",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-text-primary font-[var(--font-body)]">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

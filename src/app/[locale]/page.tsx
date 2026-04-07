import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import FeaturesGrid from "@/components/sections/FeaturesGrid";
import FeatureDeepDive from "@/components/sections/FeatureDeepDive";
import BadgesShowcase from "@/components/sections/BadgesShowcase";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import WaitlistCTA from "@/components/sections/WaitlistCTA";

type Props = {
  params: { locale: string } | Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <SocialProof />
      <FeaturesGrid />
      <FeatureDeepDive />
      <BadgesShowcase />
      <Pricing />
      <Testimonials />
      <WaitlistCTA />
    </>
  );
}

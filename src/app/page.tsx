import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="bg-[#080d1a] min-h-screen">
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <LandingFooter />
    </main>
  );
}
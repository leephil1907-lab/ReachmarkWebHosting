import { DeploymentStory } from "@/components/marketing/deployment-story";
import { HostingCoreHero } from "@/components/marketing/hosting-core-hero";
import { PlatformPillars } from "@/components/marketing/platform-pillars";
import { InfrastructureGraph } from "@/components/marketing/infrastructure-graph";
import { DeploymentTimeline } from "@/components/marketing/deployment-timeline";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FinalCta } from "@/components/marketing/final-cta";

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#050609]">
      <HostingCoreHero />
      <DeploymentStory />
      <PlatformPillars />
      <InfrastructureGraph />
      <DeploymentTimeline />
      <PricingSection />
      <FinalCta />
    </main>
  );
}

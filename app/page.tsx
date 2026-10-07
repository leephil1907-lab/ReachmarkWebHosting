import { DeploymentStory } from "@/components/marketing/deployment-story";
import { HostingCoreHero } from "@/components/marketing/hosting-core-hero";

export default function HomePage() {
  return (
    <main className="bg-[#050609]">
      <HostingCoreHero />
      <DeploymentStory />
      <section id="platform" className="min-h-screen bg-[#050609] px-6 py-32 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Reachmark platform</p>
          <h2 className="mt-5 max-w-3xl text-4xl tracking-[-0.04em] sm:text-6xl">Infrastructure that stays visible.</h2>
        </div>
      </section>
    </main>
  );
}
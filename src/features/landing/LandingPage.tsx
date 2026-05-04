import { CTA } from './components/CTA';
import { Features } from './components/Features';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Roadmaps } from './components/Roadmaps';
import { SkillGraph } from './components/SkillGraph';

export const LandingPage = () => {
    return (
        <div className="flex flex-col">
            <Hero />

            {/* Divider */}
            <div className="mx-auto my-16 w-full max-w-[1400px] px-6 lg:px-12">
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
            </div>

            <Features />
            <HowItWorks />
            <Roadmaps />
            <SkillGraph />
            <CTA />
        </div>
    );
};
